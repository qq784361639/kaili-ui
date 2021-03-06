import React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { Button, ListItem, LoginFooterItem, LoginForm, LoginPage as LoginNext } from '@patternfly/react-core';
import { ExclamationCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { KialiAppState, LoginSession, LoginStatus } from '../../store/Store';
import { AuthStrategy } from '../../types/Auth';
import { authenticationConfig, kialiLogo } from '../../config';
import { KialiAppAction } from '../../actions/KialiAppAction';
import LoginThunkActions from '../../actions/LoginThunkActions';

type LoginProps = {
  status: LoginStatus;
  session?: LoginSession;
  message?: string;
  error?: any;
  authenticate: (username: string, password: string) => void;
  checkCredentials: () => void;
  isPostLoginPerforming: boolean;
  postLoginErrorMsg?: string;
};

type LoginState = {
  username: string;
  password: string;
  isValidUsername: boolean;
  isValidPassword: boolean;
  filledInputs: boolean;
  showHelperText: boolean;
  errorInput?: string;
};

export class LoginPage extends React.Component<LoginProps, LoginState> {
  static contextTypes = {
    store: () => null
  };
  constructor(props: LoginProps) {
    super(props);

    this.state = {
      username: '',
      password: '',
      isValidUsername: true,
      isValidPassword: true,
      filledInputs: false,
      showHelperText: false,
      errorInput: ''
    };
  }

  componentDidMount() {
    // handle initial path from the browser
    this.props.checkCredentials();

    const loginInput = document.getElementById('pf-login-username-id');
    if (loginInput) {
      loginInput.focus();
    }
  }

  handleUsernameChange = value => {
    this.setState({ username: value });
  };

  handlePasswordChange = passwordValue => {
    this.setState({ password: passwordValue });
  };

  handleSubmit = (e: any) => {
    e.preventDefault();

    if (authenticationConfig.strategy === AuthStrategy.openshift) {
      // If we are using OpenShift OAuth, take the user back to the OpenShift OAuth login
      window.location.href = authenticationConfig.authorizationEndpoint!;
    } else {
      this.setState({
        isValidUsername: !!this.state.username,
        isValidPassword: !!this.state.password,
        filledInputs: !!this.state.username && !!this.state.password
      });

      if (!!this.state.username && !!this.state.password && this.props.authenticate) {
        this.props.authenticate(this.state.username, this.state.password);
        this.setState({ showHelperText: false, errorInput: '' });
      } else {
        let message = '无效的登录凭证。';
        message +=
          !!!this.state.username && !!!this.state.password
            ? '用户名和密码为必填项。'
            : !!this.state.username
            ? '密码是必填项。'
            : '用户名是必填项。';

        this.setState({
          showHelperText: true,
          errorInput: message,
          isValidUsername: false,
          isValidPassword: false
        });
      }
    }
  };
  renderMessage = (message: string | undefined, type?: string) => {
    if (!message) {
      return '';
    }
    const variant = type
      ? type
      : this.props.status === LoginStatus.error || this.state.filledInputs
      ? 'danger'
      : 'warning';
    const icon = variant === 'danger' ? <ExclamationCircleIcon /> : <ExclamationTriangleIcon />;
    return (
      <span
        key={message}
        style={{ color: variant === 'danger' ? '#c00' : '#f0ab00', fontWeight: 'bold', fontSize: 16 }}
      >
        {icon}
        &nbsp; {message}
      </span>
    );
  };

  getHelperMessage = () => {
    const messages: any[] = [];
    if (this.state.showHelperText) {
      messages.push(this.renderMessage(this.state.errorInput));
    }
    if (authenticationConfig.secretMissing) {
      messages.push(
        this.renderMessage(
          `Kiali的密码丢失。在管理员创建有效的密码之前，禁止用户访问Kiali。相关更多详细信息，请参阅Kiali文档。`,
          'danger'
        )
      );
    }
    if (this.props.status === LoginStatus.expired) {
      messages.push(this.renderMessage('您的登录状态已过期或已在另一窗口中终止。', 'warning'));
    }
    if (!authenticationConfig.secretMissing && this.props.status === LoginStatus.error) {
      messages.push(this.props.message);
    }
    if (this.props.postLoginErrorMsg) {
      messages.push(this.renderMessage(this.props.postLoginErrorMsg));
    }
    return messages;
  };

  render() {
    let loginLabel = '登录';
    if (authenticationConfig.strategy === AuthStrategy.openshift) {
      loginLabel = '以OpenShift登录';
    }

    const messages = this.getHelperMessage();
    const isLoggingIn = this.props.isPostLoginPerforming || this.props.status === LoginStatus.logging;

    // Unfortunately, typescripg typings are wrong in the PatternFly
    // library. So, this casts LoginForm as "any" so that it is
    // possible to use the "isLoginButtonDisabled" property.
    const Form = LoginForm as any;
    const loginForm = (
      <Form
        usernameLabel="用户名"
        showHelperText={this.state.showHelperText || this.props.message !== '' || messages.length > 0}
        helperText={<>{messages}</>}
        usernameValue={this.state.username}
        onChangeUsername={this.handleUsernameChange}
        isValidUsername={this.state.isValidUsername && this.props.status !== LoginStatus.error}
        passwordLabel="密码"
        passwordValue={this.state.password}
        onChangePassword={this.handlePasswordChange}
        isValidPassword={this.state.isValidPassword && this.props.status !== LoginStatus.error}
        rememberMeAriaLabel="记住选项"
        onLoginButtonClick={(e: any) => this.handleSubmit(e)}
        style={{ marginTop: '10px' }}
        loginButtonLabel={isLoggingIn ? '正在登录...' : undefined}
        isLoginButtonDisabled={isLoggingIn || this.props.postLoginErrorMsg}
      />
    );

    const listItem = (
      <>
        <ListItem>
          <LoginFooterItem href="https://www.kiali.io">文档</LoginFooterItem>
        </ListItem>
        <ListItem>
          <LoginFooterItem href="https://github.com/kiali/kiali">投稿</LoginFooterItem>
        </ListItem>
      </>
    );
    return (
      <LoginNext
        footerListVariants="inline"
        brandImgSrc={kialiLogo}
        brandImgAlt="Kiali logo"
        footerListItems={listItem}
        textContent="服务网格可观测性。"
        loginTitle="登录Kiali"
      >
        {authenticationConfig.strategy === AuthStrategy.login ? (
          loginForm
        ) : (
          <Button onClick={this.handleSubmit} style={{ width: '100%' }} variant="primary">
            {loginLabel}
          </Button>
        )}
      </LoginNext>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  status: state.authentication.status,
  message: state.authentication.message
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => ({
  authenticate: (username: string, password: string) => dispatch(LoginThunkActions.authenticate(username, password)),
  checkCredentials: () => dispatch(LoginThunkActions.checkCredentials())
});

const LoginPageContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPage);
export default LoginPageContainer;
