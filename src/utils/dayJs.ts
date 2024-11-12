import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import dayjs from "dayjs";

dayjs.locale("vi");
dayjs.extend(relativeTime);

export const getTimeFromNow = (epochTime: number) => {
  const isSeconds = epochTime < 10000000000;

  if (isSeconds) {
    return dayjs.unix(epochTime).fromNow();
  }
  return dayjs(epochTime).fromNow();
};

export const dayJs = { getTimeFromNow };
