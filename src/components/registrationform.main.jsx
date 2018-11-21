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
import ReactRouterPropTypes from 'react-router-prop-types';
import intl from 'react-intl-universal';
import { withRouter } from 'react-router';
import { registerUser } from '../utils/AuthService';
import './registrationform.main.less';

class RegistrationFormMain extends React.Component {
  static propTypes = {
    location: ReactRouterPropTypes.location.isRequired,
    history: ReactRouterPropTypes.history.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      firstname: '',
      lastname: '',
      username: '',
      password: '',
      failedRegistration: false,
      registrationErrors: '',
    };
    this.setFirstName = this.setFirstName.bind(this);
    this.setLastName = this.setLastName.bind(this);
    this.setUsername = this.setUsername.bind(this);
    this.setPassword = this.setPassword.bind(this);
    this.registerNewUser = this.registerNewUser.bind(this);
  }

  setFirstName(event) {
    this.setState({ firstname: event.target.value });
  }

  setLastName(event) {
    this.setState({ lastname: event.target.value });
  }

  setUsername(event) {
    this.setState({ username: event.target.value });
  }

  setPassword(event) {
    this.setState({ password: event.target.value });
  }

  async registerNewUser() {
    const {
      lastname, firstname, username, password,
    } = this.state;
    const { location, history } = this.props;

    try {
      await registerUser(lastname, firstname, username, password);
      history.push(location.state.returnPage || '/');
    } catch (err) {
      this.setState({
        failedRegistration: true,
        registrationErrors: err.res.parsedJson.messages.map(m => m['debug-message']).join('\n'),
      });
    }
  }

  render() {
    const { failedRegistration, registrationErrors } = this.state;
    return (
      <div className="registration-container container">
        <h3>
          {intl.get('register-new-account')}
        </h3>

        <div className="feedback-label registration-form-feedback-container feedback-display-linebreak" id="registration_form_feedback_container" data-region="registrationFeedbackMsgRegion">
          {failedRegistration ? registrationErrors : ''}
        </div>

        <div data-region="registrationFormRegion" style={{ display: 'block' }}>
          <div className="container">
            <form className="form-horizontal">
              <div className="form-group">
                <label htmlFor="registration_form_firstName_label" data-el-label="registrationForm.firstName" className="control-label registration-form-label">
                  <span className="required-label">
                    *
                  </span>
                  {' '}
                  {intl.get('first-name')}
                </label>
                <div className="registration-form-input">
                  <input id="registration_form_firstName" name="given-name" className="form-control" type="text" onChange={this.setFirstName} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="registration_form_lastName_label" data-el-label="registrationForm.lastName" className="control-label registration-form-label">
                  <span className="required-label">
                    *
                  </span>
                  {' '}
                  {intl.get('last-name')}
                </label>
                <div className="registration-form-input">
                  <input id="registration_form_lastName" name="family-name" className="form-control" type="text" onChange={this.setLastName} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="registration_form_emailUsername_label" data-el-label="registrationForm.emailUsername" className="control-label registration-form-label">
                  <span className="required-label">
                    *
                  </span>
                  {' '}
                  {intl.get('email-slash-username')}
                </label>
                <div className="registration-form-input">
                  <input id="registration_form_emailUsername" name="username" className="form-control" type="email" onChange={this.setUsername} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="registration_form_password_label" data-el-label="registrationForm.password" className="control-label registration-form-label">
                  <span className="required-label">
                    *
                  </span>
                  {' '}
                  {intl.get('password')}
                </label>
                <div className="registration-form-input">
                  <input id="registration_form_password" name="password" className="form-control" type="password" onChange={this.setPassword} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="registration_form_passwordConfirm_label" data-el-label="registrationForm.passwordConfirm" className="control-label registration-form-label">
                  <span className="required-label">
                    *
                  </span>
                  {' '}
                  {intl.get('password-confirmation')}
                </label>
                <div className="registration-form-input">
                  <input id="registration_form_passwordConfirm" name="passwordConfirm" className="form-control" type="password" onChange={this.setPasswordConfirmation} />
                </div>
              </div>
              <div className="form-group">
                <input className="btn btn-primary registration-save-btn" id="registration_form_register_button" data-cmd="register" type="button" onClick={this.registerNewUser} value="Submit" />
              </div>
            </form>
          </div>
        </div>

      </div>
    );
  }
}

export default withRouter(RegistrationFormMain);
