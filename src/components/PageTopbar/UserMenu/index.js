import { Button } from '@nghiepuit/ui';
import _isEmpty from 'lodash-es/isEmpty';
import React from 'react';
import { useUserData } from './../../../dataProvider/user';
import { DATA_STATUS } from './../../../redux';
import LoginWrapper from './../../LoginWrapper';
import styles from './styles.module.scss';

const UserMenu = () => {
  const userData = useUserData();
  const { status, data } = userData.current;
  console.log('userData: ', userData);

  // if (status <= DATA_STATUS.PENDING) {
  //   return null;
  // }

  if (_isEmpty(data)) {
    return (
      <LoginWrapper event="click">
        <Button>Đăng nhập</Button>
      </LoginWrapper>
    );
  }

  return (
    <div className={styles['root']}>
      <Button>Xin chào, Testing</Button>
    </div>
  );
};

export default React.memo(UserMenu);
