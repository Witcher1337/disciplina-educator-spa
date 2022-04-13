import React, { Component, PureComponent, useEffect } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import Header from "./Containers/Header";
import "./App.scss";
import AuthContainer from "./Containers/Auth";
import FaircvList from "./Containers/FaircvList";
import AAAService from "./Services/aaa";
import AddFairCV from "./Containers/AddFairCV";
import MainMessage from "./Common/Components/MainMessage";
import Button from "./Common/Components/Button";
import { useConnect } from "./libs/web3/hooks";
import { usePersistanceState } from "./libs/usePersistanceState";

const withUserContext = (WrappedComponent: Component, isGuardEnabled: boolean) => {
  type PrivateContainerProps = {
    history: { push: (url: string) => void },
    location: { pathname: string },
    metaMask: {
      connected: Boolean,
      connect: () => void
    }
  };

  return class PrivateContainer extends PureComponent<PrivateContainerProps> {
    state = {
      isLoading: true,
      isAuthenticated: false,
      user: {}
    };

    async componentDidMount() {
      try {
        const userResponse = await AAAService.getCurrentUser();
        this.setState({
          isLoading: false,
          isAuthenticated: true,
          user: userResponse.data
        });
      } catch (e) {
        this.setState({ isLoading: false, isAuthenticated: false });
      }
    }

    render() {
      // TODO while no redux accept header inside HoC
      const { isAuthenticated, isLoading, user } = this.state;
      if (isLoading) return <h5>Loading...</h5>;
      if ((!isAuthenticated || !user.confirmedAt || !user.confirmedByOrganization) && isGuardEnabled) {
        return <Redirect to="/auth" />;
      }
      return (
        <>
          <Header user={user} />
          <WrappedComponent {...this.props} user={user} />
        </>
      );
    }
  };
};

const Faircv = () => {
  const [isConnectedBefore, setisConnectecBefore] = usePersistanceState(false, "metamast-connected");
  const { connected, connect } = useConnect();

  useEffect(() => {
    setisConnectecBefore(connected);
  }, [connected]);

  useEffect(() => {
    if (isConnectedBefore && !connected) {
      connect();
    }
  }, [isConnectedBefore, connected]);

  return (
    <>
      {connected ? (
        <Switch>
          <Redirect exact from="/faircv" to="/faircv/list" />
          <Route exact path="/faircv/create" component={AddFairCV} />
          <Route exact path="/faircv/list" component={FaircvList} />
        </Switch>
      ) : (
        <Button
          text="Connect Metamask"
          modWidth="width-auto"
          modHeight="height-big"
          modStyle="filled"
          modColor="color-main"
          callback={connect}
        />
      )}
    </>
  );
};

const Confirmation = () => (
  <>
    <Header user={{}} />
    <MainMessage type="CONFIRMED" />
  </>
);

const CheckEmail = () => (
  <>
    <Header user={{}} />
    <MainMessage type="CHECK_EMAIL" />
  </>
);

const App = () => {
  return (
    <div className="App">
      <main className="main">
        <Switch>
          <Redirect exact from="/" to="/faircv" />
          <Route path="/auth/check_email" component={CheckEmail} />
          <Route path="/auth/confirmation" component={Confirmation} />
          <Route path="/auth" component={withUserContext(AuthContainer, false)} />
          <Route path="/faircv" component={withUserContext(Faircv, true)} />
        </Switch>
      </main>
    </div>
  );
};

export default App;
