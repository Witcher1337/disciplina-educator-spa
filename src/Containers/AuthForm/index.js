// @flow
import React, { PureComponent } from "react";
import AAAService from "../../Services/aaa";
import logoIcon from "../../Common/Assets/main-logo.svg";
import "./styles.scss";
import Button from "../../Common/Components/Button";
import type { IAAAService } from "../../Services/types";

export const AUTH_FORM_STATES = {
  SIGN_IN: "signIn",
  SIGN_UP: "signUp",
  RESET: "reset",
  RECOVERY: "recovery"
};

const errorsMessagesCollection = {
  emailInvalid: "Некорректный  email адрес",
  emailNotfound: "Пользователь с таким email адресом не найден",
  emailEmpty: "Введите email",
  emailUsed: "Пользователь с таким email адресом уже существует",
  passwordWrong: "Email адрес и пароль не совпадают",
  passwordEmpty: "Введите пароль",
  passwordShort: "Пароль должен содержать 6 и более знаков",
  orgNameEmpty: "Введите название организации",
  webSiteEmpty: "Введите сайт организации"
};

const initialEmptyMessages = {
  currentEmailErrorMessage: "",
  currentPasswordErrorMessage: "",
  currentNameErrorMessage: "",
  currentWebsiteErrorMessage: ""
};

type AuthFormState = {
  currentState: $Values<typeof AUTH_FORM_STATES>,
  isLoading: boolean,
  email: string,
  password: string,
  newPassword: string,
  name: string,
  url: string,
  token: string,
  isError: boolean,
  currentEmailErrorMessage: string,
  currentPasswordErrorMessage: string,
  currentNameErrorMessage: string,
  currentWebsiteErrorMessage: string
};

type AuthFormProps = {
  history: any,
  location: any
};

class AuthForm extends PureComponent<AuthFormProps, AuthFormState> {
  Service: IAAAService = AAAService;

  state: AuthFormState = {
    currentState: AUTH_FORM_STATES.SIGN_IN,
    isError: false,
    isLoading: false,
    email: "",
    password: "",
    newPassword: "",
    name: "",
    url: "",
    token: "",
    ...initialEmptyMessages
  };

  componentDidMount(): void {
    const { location } = this.props;
    let urlParams;
    let token;
    if (location) {
      urlParams = new URLSearchParams(location.search);
      token = urlParams.get("reset_password_token") || "";
    }
    if (token) {
      this.setState({ token });
      this.goToResetTab();
    }
  }

  setError = (errorBody: {}) => this.setState({ isError: true, ...errorBody });

  clearCurrentErrorsMessage = () => {
    this.setState({
      ...initialEmptyMessages
    });
  };

  errorsParser = (loginError: any) => {
    this.clearCurrentErrorsMessage();
    const messagesForState = {};
    /* eslint-disable no-restricted-syntax, guard-for-in */
    for (const key in loginError) {
      switch (key) {
        case "email":
          {
            const errorStatus = loginError[key][0].predicate;
            if (errorStatus === "filled?") {
              messagesForState.currentEmailErrorMessage = errorsMessagesCollection.emailEmpty;
            } else if (errorStatus === "email?") {
              messagesForState.currentEmailErrorMessage = errorsMessagesCollection.emailInvalid;
            } else if (errorStatus === "unique?") {
              messagesForState.currentEmailErrorMessage = errorsMessagesCollection.emailUsed;
            } else {
              messagesForState.currentEmailErrorMessage = "Ошибка email";
            }
          }
          break;
        case "password":
          {
            const errorStatus = loginError[key][0].predicate;
            if (errorStatus === "filled?") {
              messagesForState.currentPasswordErrorMessage = errorsMessagesCollection.passwordEmpty;
            } else if (errorStatus === "valid?") {
              messagesForState.currentPasswordErrorMessage = errorsMessagesCollection.passwordWrong;
            } else if (errorStatus === "min_size?") {
              messagesForState.currentPasswordErrorMessage = errorsMessagesCollection.passwordShort;
            } else {
              messagesForState.currentPasswordErrorMessage = "Ошибка пароля: Слишком простой";
            }
          }
          break;
        case "name":
          {
            const errorStatus = loginError[key][0].predicate;
            if (errorStatus === "filled?") {
              messagesForState.currentNameErrorMessage = errorsMessagesCollection.orgNameEmpty;
            } else {
              messagesForState.currentNameErrorMessage = "Name error";
            }
          }
          break;
        case "website":
          {
            const errorStatus = loginError[key][0].predicate;
            if (errorStatus === "filled?") {
              messagesForState.currentWebsiteErrorMessage = errorsMessagesCollection.webSiteEmpty;
            } else {
              messagesForState.currentWebsiteErrorMessage = "Website error";
            }
          }
          break;
        default:
          console.log("error");
      }
      /* eslint-enable no-restricted-syntax, guard-for-in */
    }

    if (!loginError) {
      messagesForState.currentEmailErrorMessage = errorsMessagesCollection.emailNotfound;
    }

    return messagesForState;
  };

  clearError = () => this.setState({ isError: false });

  login = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password } = this.state;
    const { history } = this.props;
    this.clearError();
    this.startLoading();
    try {
      await this.Service.login(email, password);
      history.push("/faircv");
    } catch (loginError) {
      const errorBody = this.errorsParser(loginError);
      this.setError(errorBody);
      this.stopLoading();
    }
  };

  signUp = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { history } = this.props;
    const { email, password, name, url } = this.state;
    this.clearError();
    this.startLoading();
    try {
      await this.Service.createUser(email, name, url, password);
      history.push("/auth/check_email");
    } catch (signupError) {
      const errorBody = this.errorsParser(signupError);
      this.setError(errorBody);
      this.stopLoading();
    }
  };

  setNewPassword = async () => {
    const { newPassword, token } = this.state;
    this.clearError();
    this.startLoading();
    try {
      await this.Service.createPassword(newPassword, token);
    } catch (setNewPasswordError) {
      console.log(setNewPasswordError);
      const errorBody = this.errorsParser(setNewPasswordError);
      this.setError(errorBody);
    } finally {
      this.stopLoading();
    }
  };

  resetPassword = async () => {
    const { email } = this.state;
    this.clearError();
    this.startLoading();
    try {
      await this.Service.resetPassword(email);
    } catch (resetError) {
      const errorBody = this.errorsParser(resetError);
      this.setError(errorBody);
    } finally {
      this.stopLoading();
    }
  };

  handleEmailInput = (e: SyntheticEvent<HTMLInputElement>) => this.setState({ email: e.currentTarget.value });

  handlePasswordInput = (e: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ password: e.currentTarget.value });
  };

  handleNewPasswordInput = (e: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ newPassword: e.currentTarget.value });
  };

  handleNameInput = (e: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ name: e.currentTarget.value });
  };

  handleUrlInput = (e: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ url: e.currentTarget.value });
  };

  startLoading = () => this.setState({ isLoading: true });

  stopLoading = () => this.setState({ isLoading: false });

  goToRegisterTab = () =>
    this.setState({
      currentState: AUTH_FORM_STATES.SIGN_UP,
      isError: false
    });

  goToSigninTab = () =>
    this.setState({
      currentState: AUTH_FORM_STATES.SIGN_IN,
      isError: false
    });

  goToResetTab = () =>
    this.setState({
      currentState: AUTH_FORM_STATES.RESET,
      isError: false
    });

  goToRecoveryTab = () =>
    this.setState({
      currentState: AUTH_FORM_STATES.RECOVERY,
      isError: false
    });

  render() {
    const {
      currentState,
      email,
      password,
      name,
      newPassword,
      url,
      isLoading,
      isError,
      currentEmailErrorMessage,
      currentPasswordErrorMessage,
      currentNameErrorMessage,
      currentWebsiteErrorMessage
    } = this.state;

    return (
      <div className="container">
        <div className="auth-form">
          <div className="auth-form__header">
            <img className="auth-form__logo" src={logoIcon} alt="" />
          </div>
          <div className="auth-form__main">
            {
              {
                [AUTH_FORM_STATES.SIGN_IN]: (
                  <>
                    <div className="auth-form__tabs">
                      <button className="tab active" href="1" type="button">
                        Вход с паролем
                      </button>
                      <button className="tab" href="1" onClick={this.goToRegisterTab} type="button">
                        Регистрация
                      </button>
                    </div>
                    <form className="secret__key-auth login-form" onSubmit={this.login}>
                      <div className="login-form__input-container">
                        <input
                          className={`
                            login-form__input
                            login-form__input--email
                            ${email ? "login-form__input--filled" : ""}
                          `}
                          placeholder="Электронная почта"
                          value={email}
                          onChange={this.handleEmailInput}
                        />
                        {isError ? (
                          <span className="login-form__message valid-message">{currentEmailErrorMessage}</span>
                        ) : null}
                      </div>
                      <div className="login-form__input-container">
                        <input
                          className={`
                            login-form__input
                            login-form__input--password
                            ${password ? "login-form__input--filled" : ""}
                          `}
                          placeholder="Пароль"
                          value={password}
                          onChange={this.handlePasswordInput}
                          type="password"
                        />
                        {isError ? (
                          <span className="login-form__message valid-message">{currentPasswordErrorMessage}</span>
                        ) : null}
                      </div>
                      <Button
                        type="submit"
                        text="Войти"
                        modWidth="width-full"
                        modHeight="height-big"
                        modStyle="filled"
                        modColor="color-main"
                        callback={this.login}
                        disabled={isLoading}
                      />
                      <Button
                        text="Я забыл пароль"
                        modStyle="simple"
                        modColor="color-main"
                        callback={this.goToRecoveryTab}
                      />
                    </form>
                  </>
                ),
                [AUTH_FORM_STATES.SIGN_UP]: (
                  <>
                    <div className="auth-form__tabs">
                      <button className="tab" href="1" onClick={this.goToSigninTab} type="button">
                        Вход с паролем
                      </button>
                      <button className="tab active" href="1" type="button">
                        Регистрация
                      </button>
                    </div>
                    <form className="secret__key-auth login-form" onSubmit={this.signUp}>
                      <div className="login-form__input-container">
                        <input
                          className={`
                            login-form__input
                            login-form__input--email
                            ${email ? "login-form__input--filled" : ""}
                          `}
                          placeholder="Электронная почта"
                          value={email}
                          onChange={this.handleEmailInput}
                        />
                        {isError ? (
                          <span className="login-form__message valid-message">{currentEmailErrorMessage}</span>
                        ) : null}
                      </div>
                      <div className="login-form__input-container">
                        <input
                          className={`
                            login-form__input
                            login-form__input--org-name
                            ${name ? "login-form__input--filled" : ""}
                          `}
                          placeholder="Название организации"
                          value={name}
                          onChange={this.handleNameInput}
                        />
                        {isError ? (
                          <span className="login-form__message valid-message">{currentNameErrorMessage}</span>
                        ) : null}
                      </div>
                      <div className="login-form__input-container">
                        <input
                          className={`
                            login-form__input
                            login-form__input--site
                            ${url ? "login-form__input--filled" : ""}
                          `}
                          placeholder="Сайт организации"
                          value={url}
                          onChange={this.handleUrlInput}
                        />
                        {isError ? (
                          <span className="login-form__message valid-message">{currentWebsiteErrorMessage}</span>
                        ) : null}
                      </div>
                      <div className="login-form__input-container">
                        <input
                          className={`
                            login-form__input
                            login-form__input--password
                            ${password ? "login-form__input--filled" : ""}
                          `}
                          placeholder="Пароль"
                          value={password}
                          onChange={this.handlePasswordInput}
                          type="password"
                        />
                        {isError ? (
                          <span className="login-form__message valid-message">{currentPasswordErrorMessage}</span>
                        ) : null}
                      </div>
                      <Button
                        type="submit"
                        text="Зарегистрироваться"
                        modWidth="width-full"
                        modHeight="height-big"
                        modStyle="filled"
                        modColor="color-main"
                        callback={this.signUp}
                        disabled={isLoading}
                      />
                    </form>
                  </>
                ),
                [AUTH_FORM_STATES.RESET]: (
                  <>
                    <p className="auth-form__title">Создание нового пароля</p>
                    <form className="login-form">
                      <div className="login-form__input-container">
                        <input
                          className={`
                            login-form__input
                            login-form__input--password
                            ${newPassword ? "login-form__input--filled" : ""}
                          `}
                          placeholder="Новый пароль"
                          value={newPassword}
                          onChange={this.handleNewPasswordInput}
                        />
                        {isError ? (
                          <span className="login-form__message valid-message">{currentPasswordErrorMessage}</span>
                        ) : null}
                      </div>
                      <Button
                        text="Сохранить"
                        modWidth="width-full"
                        modHeight="height-big"
                        modStyle="filled"
                        modColor="color-main"
                        callback={this.setNewPassword}
                        disabled={isLoading}
                      />
                    </form>
                  </>
                ),
                [AUTH_FORM_STATES.RECOVERY]: (
                  <>
                    <Button
                      callback={this.goToSigninTab}
                      text="Вернуться назад"
                      modStyle="arrow-back"
                      modColor="color-main"
                    />
                    <p className="auth-form__title">Восстановление пароля</p>
                    <form className="login-form">
                      <div className="login-form__input-container">
                        <input
                          className={`
                            login-form__input
                            login-form__input--email
                            ${email ? "login-form__input--filled" : ""}
                          `}
                          placeholder="Электронная почта"
                          value={email}
                          onChange={this.handleEmailInput}
                        />
                        {isError ? (
                          <span className="login-form__message valid-message">{currentEmailErrorMessage}</span>
                        ) : null}
                      </div>
                      <Button
                        text="Отправить"
                        modWidth="width-full"
                        modHeight="height-big"
                        modStyle="filled"
                        modColor="color-main"
                        callback={this.resetPassword}
                        disabled={isLoading}
                      />
                    </form>
                  </>
                )
              }[currentState]
            }
          </div>
        </div>
      </div>
    );
  }
}

export default AuthForm;
