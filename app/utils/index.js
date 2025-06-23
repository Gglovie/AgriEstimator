// Fetch user costs and hours for MarketTrends
export const get_user_costs_and_hours = async (userId) => {
  try {
    const res = await axios.get(
      API_BASE_URL + `cost-summary?user_id=${userId}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return res;
  } catch (error) {
    console.log(error);
  }
};
import axios from "axios";

// api -https://agribackend-omega.vercel.app/

const API_BASE_URL = "https://agribackend-omega.vercel.app/";

export const login = async (data) => {
    // console.log(email + '' + password)
    // return;

  try {
    const res = await axios.post(
      API_BASE_URL + "login",
      { ...data },
      { headers: { "Content-Type": "application/json" } }
    );
    return res;
  } catch (error) {
    console.log(error);
  }
};
export const register = async (data) => {
  try {
    const res = await axios.post(
      API_BASE_URL + "register",
      { ...data },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return res;
  } catch (error) {
    console.log(error);
  }
};
export const create_cost = async (data) => {
    console.log(data);
  try {
    const res = await axios.post(
      API_BASE_URL + "cost/create",
      { ...data, id: gen_rand() },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const calc_fair_share = async (id, crop, unit) => {
  try {
    const res = await axios.get(
      API_BASE_URL + `calculate-market-trend?user_id=${id}&units=${unit}&crop=${crop}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return res;
  } catch (error) {
    console.log(error);
  }
};
// export const calc_market_trends = async (id, crop, unit) => {
//   try {
//     const res = await axios.get(
//       API_BASE_URL + `calculate-market-trend?user_id=${id}&units=${unit}&crop=${crop}`,
//       {
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//     return res;
//   } catch (error) {
//     console.log(error);
//   }
// };
export const create_crop = async (id, name) => {
    const crop = {
        id: name,
        name: name
      }
    //   const data = {"user_id":id, "crop_id": crop.id, "crop_name": crop.name}
  try {
    const res = await axios.get(
      API_BASE_URL + `add-crop?user_id=${id}&crop_id=${crop.id}&crop_name=${crop.name}`,
    //    {...data},
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return {result: res, crop: crop};
  } catch (error) {
    console.log(error);
  }
};

export const get_user = async (id) => {
    try {
    const res = await axios.get(
      API_BASE_URL + `user?id=${id}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return res;
  } catch (error) {
    console.log(error);
  }
};


export const gen_rand = (length = 10) => {
  const ansc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let str = "";
  for (let index = 0; index < length; index++) {
    str += ansc.charAt(Math.floor(Math.random() * ansc.length));
  }
  return str.toLowerCase();
};

// Default export of utility functions
export default {
  login,
  register,
  gen_rand,
  calc_fair_share,
};
