let data = null;
export default async (staticRes) => {
  try {
    data = process.env.APP_BASE_DOMAIN;
    return data;
  } catch (error) {
    console.log(error);
  }
};
