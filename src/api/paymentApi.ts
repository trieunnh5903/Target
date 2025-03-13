import { ZaloPayOrder, ZaloPayOrderResponse } from "@/types";
import axios from "axios";
import CryptoJS from "crypto-js";

const zpConfig = {
  app_id: "2554",
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

export const paymentApi = {
  createZpOrder: async (params: Pick<ZaloPayOrder, "amount" | "app_user">) => {
    const body = createZpOrderBody(params);

    try {
      const orderResponse = await axios.post(zpConfig.endpoint, body, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      });
      return orderResponse.data as ZaloPayOrderResponse;
    } catch (error) {
      console.log("createZpOrder error", error);
    }
  },
};

const createZpOrderBody = (
  params: Pick<ZaloPayOrder, "amount" | "app_user">
) => {
  let apptransid = getCurrentDateYYMMDD() + "_" + new Date().getTime();
  let appid = zpConfig.app_id;
  let amount = params.amount;
  let appuser = params.app_user;
  let apptime = new Date().getTime();
  let embeddata = "{}";
  let item = "[]";
  let description = "Target - Payment for order #" + apptransid;
  let hmacInput =
    appid +
    "|" +
    apptransid +
    "|" +
    appuser +
    "|" +
    amount +
    "|" +
    apptime +
    "|" +
    embeddata +
    "|" +
    item;
  let mac = CryptoJS.HmacSHA256(hmacInput, zpConfig.key1).toString();

  const order = {
    app_id: appid,
    app_user: appuser,
    app_time: apptime,
    amount: amount,
    app_trans_id: apptransid,
    embed_data: embeddata,
    item: item,
    description: description,
    mac: mac,
  };

  const requestBody = Object.entries(order)
    .map(([key, value]) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");

  return requestBody;
};

function getCurrentDateYYMMDD() {
  let todayDate = new Date().toISOString().slice(2, 10);
  return todayDate.split("-").join("");
}
