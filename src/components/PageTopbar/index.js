import { Grid, Image, Typography, TypoSizes, Box } from '@nghiepuit/ui';
import React from 'react';
import styles from './styles.module';
import UserMenu from './UserMenu';

const PageTopbar = () => {
  return (
    <Box py={5}>
      <Grid container alignItem="center" justifyContent="center" spacing={4}>
        <Grid item xs="auto">
          <Typography size={TypoSizes.body1}>Trang chủ</Typography>
        </Grid>
        <Grid item xs="auto">
          <Typography>Chủ đề</Typography>
        </Grid>
        <Grid item xs="auto">
          <Image
            src="/static/images/logo.png"
            className={styles['logo']}
            alt="logo"
          />
        </Grid>
        <Grid item xs="auto">
          <Typography>Triết lý</Typography>
        </Grid>
        <Grid item xs="auto">
          <Typography>Gói</Typography>
        </Grid>
        <Grid item xs="auto">
          <UserMenu />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PageTopbar;
