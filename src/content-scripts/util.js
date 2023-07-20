function replacePlaceholders(str, fileName, lineNumber, columnNumber) {
  const regex = /\$\{fileName\}|\$\{lineNumber\}|\$\{columnNumber\}/g;
  return str.replace(regex, (match) => {
    switch (match) {
      case "${fileName}":
        return fileName;
      case "${lineNumber}":
        return lineNumber;
      case "${columnNumber}":
        return columnNumber;
      default:
        return match;
    }
  });
}

export function getJumpUrl(elemPath) {
  let { columnNumber, fileName, lineNumber } = elemPath;
  //rspack: /</Users/bytedance/Desktop/slardar/apps/argos/src/modules/alarm/components/layouts/AntdLayoutCard/index.tsx>:24:5
  let url = "";

  if (this.buildTool === "rspack") {
    fileName = fileName.match(/^<(.*)>$/)[1];
  }
  if (this.customPath) {
    return replacePlaceholders(
      this.customPath,
      fileName,
      lineNumber,
      columnNumber
    );
  }
  if (this.editor === "webStorm") {
    url = `webstorm://open?file=${fileName}&line=${lineNumber}&column=${columnNumber}`;
  } else {
    url = `${
      this.editor || "vscode"
    }://file/${fileName}:${lineNumber}:${columnNumber}`;
  }
  return url;
}
