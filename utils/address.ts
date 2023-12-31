import * as fs from "fs";

export const getAddressPath = (networkName: string) =>
  `${__dirname}/../addressList/${networkName}.json`;

export const getAddressList = async (
  networkName: string
): Promise<Record<string, string>> => {
  const addressPath = getAddressPath(networkName);
  try {
    const data = fs.readFileSync(addressPath);
    return JSON.parse(data.toString());
  } catch (e) {
    return {};
  }
};

export const saveAddresses = async (
  networkName: string,
  newAddrList: Record<string, string>
) => {
  const addressPath = getAddressPath(networkName);
  const addressList = await getAddressList(networkName);

  const pathArr = addressPath.split("/");
  const dirPath = [...pathArr].slice(0, pathArr.length - 1).join("/");

  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

  return fs.writeFileSync(
    addressPath,
    JSON.stringify(
      {
        ...addressList,
        ...newAddrList,
      },
      null,
      2
    )
  );
};
