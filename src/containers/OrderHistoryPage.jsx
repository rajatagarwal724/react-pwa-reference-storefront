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
import intl from 'react-intl-universal';
import PropTypes from 'prop-types';
import { login } from '../utils/AuthService';
import { purchaseLookup, cortexFetchPurchaseLookupForm } from '../utils/CortexLookup';
import PurchaseDetailsMain from '../components/purchasedetails.main';
import './OrderHistoryPage.less';

class OrderHistoryPage extends React.Component {
  static propTypes = {
    match: PropTypes.objectOf(PropTypes.any).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      purchaseData: undefined,
    };
  }

  componentDidMount() {
    this.fetchPurchaseData();
  }

  fetchPurchaseData() {
    const { match } = this.props;
    const orderId = decodeURIComponent(match.params.url);
    login().then(() => {
      cortexFetchPurchaseLookupForm()
        .then(() => purchaseLookup(orderId)
          .then((res) => {
            this.setState({
              purchaseData: res,
            });
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error.message);
          }));
    });
  }

  render() {
    const { purchaseData } = this.state;
    if (purchaseData) {
      return (
        <div>
          <div className="app-main" style={{ display: 'block' }}>
            <div className="container">
              <h2 className="view-title">
                {intl.get('purchase-details')}
              </h2>
              <PurchaseDetailsMain data={purchaseData} />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="loader" />
      </div>
    );
  }
}

export default OrderHistoryPage;
