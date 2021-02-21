import {
  Button,
  Grid,
  Modal,
  ModalBody,
  ModalHeader,
  TextField,
  Typography,
  TypoSizes,
  TypoWeights,
} from '@nghiepuit/ui';
import _startCase from 'lodash-es/startCase';
import React, { useCallback, useState, useEffect } from 'react';
import { useAuthActions, useAuthGetter } from '../../dataProvider/auth';
import { buildPathFromPageName } from '../../helpers/routes';
import { createFetcher, createGetter, useAction } from '../../redux';
import { userDataConfig } from './../../dataProvider/user';
import { PAGE_FUNDOO_BOARD_NAME } from './../../helpers/routes';
import { push } from './../../redux/actions/history';

const useUserGetter = createGetter(userDataConfig);
const useUserFetcher = createFetcher(userDataConfig);

const LoginWrapper = ({ children, event }) => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const authGetter = useAuthGetter();
  const authActions = useAuthActions(authGetter);
  const actions = useAction({ push });
  const userGetter = useUserGetter();
  const fetchCurrentUser = useUserFetcher(userGetter);

  useEffect(() => {
    _fetchCurrentUser();
  }, []);

  const _fetchCurrentUser = useCallback(() => {
    fetchCurrentUser();
  }, []);

  const _hookAction = () => {
    setOpen(true);
  };

  const _handleCloseModal = () => {
    setOpen(false);
  };

  const _handleSubmit = (e) => {
    e.preventDefault();
    const { loginByUsername } = authActions;
    const payload = {
      grant_type: 'password',
      username,
      password,
    };
    loginByUsername({
      payload,
      onLoginSuccessCallback: _handleLoginSuccess,
    });
  };

  const _handleLoginSuccess = useCallback(() => {
    _fetchCurrentUser();
    _handleCloseModal();
    const url = buildPathFromPageName(PAGE_FUNDOO_BOARD_NAME)();
    actions.push(url);
  }, []);

  const childProps = {
    ...children.props,
    ['on' + _startCase(event)]: _hookAction,
  };

  return (
    <div>
      {React.cloneElement(children, childProps)}
      {open && (
        <Modal onClose={_handleCloseModal}>
          <ModalHeader onClose={_handleCloseModal}>
            <Typography size={TypoSizes.body1} weight={TypoWeights.bold}>
              Login
            </Typography>
          </ModalHeader>
          <ModalBody>
            <form name="login" onSubmit={_handleSubmit}>
              <Grid container spacing={4}>
                <Grid item>
                  <TextField
                    label="Username"
                    name="username"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                  />
                </Grid>
                <Grid item>
                  <Grid container justifyContent="flex-end" spacing={4}>
                    <Grid item xs="auto">
                      <Button>Đăng Nhập</Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </form>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};

export default LoginWrapper;
