/**
 * Copyright © 2018 Elastic Path Software Inc. All rights reserved.
 *
 * This is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this license. If not, see
 *
 *     https://www.gnu.org/licenses/
 *
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import intl from 'react-intl-universal';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { login, logout } from '../utils/AuthService';
import cortexFetch from '../utils/Cortex';

const Config = require('Config');

// Array of zoom parameters to pass to Cortex
const zoomArray = [
  'navigations:element',
  'navigations:element:child',
  'navigations:element:child:child',
];

class AppHeaderNavigationMain extends React.Component {
  static propTypes = {
    history: ReactRouterPropTypes.history.isRequired,
    isOfflineCheck: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      navigations: [],
    };
  }

  componentWillMount() {
    login()
      .then(() => cortexFetch(`/?zoom=${zoomArray.join()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem(`${Config.cortexApi.scope}_oAuthToken`),
          },
        }))
      .then((res) => {
        if (res.status === 504 || res.status === 503) {
          const { history } = this.props;
          history.push('/maintenance');
        }
        if (res.status === 401 || res.status === 403) {
          logout().then(() => {
            login().then(() => {
              const { history } = this.props;
              history.push('/');
              window.location.reload();
            });
          });
        }
        return res;
      })
      .then(res => res.json())
      .then((res) => {
        this.setState({
          navigations: res._navigations[0]._element,
        });
        this.handleIsOffline(false);
      })
      .catch((error) => {
        if (error.status === 504 || error.status === 503) {
          const { history } = this.props;
          history.push('/maintenance');
        } else {
          // eslint-disable-next-line no-console
          console.error(error.message);
          this.handleIsOffline(true);
        }
      });
  }

  handleIsOffline = (isOfflineValue) => {
    const { isOfflineCheck } = this.props;
    isOfflineCheck(isOfflineValue);
  }

  renderCategories() {
    const { navigations } = this.state;
    return navigations.map((category) => {
      if (category._child) {
        return (
          <li className="nav-item dropdown" key={category.name} data-name={category['display-name']} data-el-container="category-nav-item-container">
            <a className="nav-link dropdown-toggle" href="/" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {category['display-name']}
            </a>
            <div className="dropdown-menu sub-category-dropdown-menu" aria-label="navbarDropdown">
              {category._child.map((subcategory) => {
                if (subcategory._child) {
                  return (
                    <li className="nav-item dropdown" key={subcategory.name} data-name={subcategory['display-name']} data-el-container="category-nav-item-container">
                      <a className="nav-link dropdown-toggle" href="/" id="navbarSubDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {subcategory['display-name']}
                      </a>
                      {subcategory._child.map((subsubcategory) => {
                        return (
                          <Link to={`/category/${encodeURIComponent(subsubcategory.self.uri)}`} key={subsubcategory.name} className="dropdown-item subsubcategory" id={`header_navbar_sub_category_button_${subsubcategory.name}`} data-target=".navbar-collapse" title={subsubcategory['display-name']}>
                            <span>
                              {subsubcategory['display-name']}
                            </span>
                          </Link>
                        );
                      })}
                    </li>
                  );
                }
                return (
                  <Link to={`/category/${encodeURIComponent(subcategory.self.uri)}`} key={subcategory.name} className="dropdown-item" id={`header_navbar_sub_category_button_${subcategory.name}`} data-target=".navbar-collapse" title={subcategory['display-name']}>
                    <span>
                      {subcategory['display-name']}
                    </span>
                  </Link>
                );
              })
              }
            </div>
          </li>
        );
      }
      return (
        <li key={category.name} data-name={category['display-name']} data-el-container="category-nav-item-container">
          <Link to={`/category/${encodeURIComponent(category.self.uri)}`} className="nav-item" id={`header_navbar_category_button_${category.name}`} data-target=".navbar-collapse" title={category['display-name']}>
            <span>
              {category['display-name']}
            </span>
          </Link>
        </li>
      );
    });
  }

  render() {
    return (
      <div className="main-nav-container" id="header_navbar_container" data-region="mainNavRegion" style={{ display: 'block' }}>
        <div>
          <nav className="main-nav">
            <button className="btn-main-nav-toggle btn-link-cmd" type="button" id="header_navbar_container_categories_button" style={{ display: 'none' }}>
              {intl.get('categories')}
            </button>
            <ul className="main-nav-list nav navbar-nav" data-region="mainNavList">
              {this.renderCategories()}
            </ul>
          </nav>
        </div>
      </div>
    );
  }
}

export default withRouter(AppHeaderNavigationMain);
