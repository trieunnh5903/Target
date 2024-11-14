export const generateKeywords = (displayName: string) => {
  const keywords: string[] = [];
  let currentStr = "";
  displayName
    .toLowerCase()
    .split("")
    .forEach((char) => {
      currentStr += char;
      keywords.push(currentStr);
    });
  return keywords;
};
