/** 数值工具 **/
/**
 * @name 字节大小
 * @param {number} [byte=0] 字节
 */
const ByteSize = (byte = 0) => {
  if (byte === 0) {
    return "0 B";
  }
  const unit = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(byte) / Math.log(unit));
  return (byte / Math.pow(unit, i)).toPrecision(3) + " " + sizes[i];
};

/**
 * @name 范围随机数
 * @param {number} [min=0] 最小数
 * @param {number} [max=10] 最大数
 */
const RandomNum = (min = 0, max = 10) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * @name 精确数值(四舍五入和百分比)
 * @param {number} [num=0] 数值
 * @param {number} [dec=2] 小数个数
 * @param {boolean} [per=false] 是否百分比
 */
const RoundNum = (num = 0, dec = 2, per = false) => {
  return per
    ? Math.round(num * 10 ** dec * 100) / 10 ** dec + "%"
    : Math.round(num * 10 ** dec) / 10 ** dec;
};

/**
 * @name 是否为图片
 * @param {number} [num=0] 数值
 * @returns {boolean}
 */
const isImgFile = (file) => {
  return (
    file.indexOf(".png") >= 0 ||
    file.indexOf(".jpg") >= 0 ||
    file.indexOf(".jpeg") >= 0
  );
};

export { ByteSize, RandomNum, RoundNum, isImgFile };

// export default {
//   ByteSize,
//   RandomNum,
//   RoundNum,
// };
