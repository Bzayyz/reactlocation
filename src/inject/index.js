class Installer {
  #register;
  constructor() {
    this.packages = [];
    this.#register = [this.#_fetchByCdnJs, this.#_fetchByJsdelivr];
  }

  add = (name) => {
    if (/^https?:\/\//.test(name)) {
      return this.#inject(name);
    }

    // // If version specified, try unpkg
    // if (name.indexOf("@") !== -1) {
    //   return this.#unpkg(name);
    // }
    else {
      if (this.packages.some((p) => p.packageName === name)) {
        return `${name}已存在`;
      }
      try {
        Promise.any(this.#register.map((fetch) => fetch(name))).then(
          (detail) => {
            this.#_install(detail);
            return "start";
          }
        );
      } catch (error) {
        this.#errorLog(name);
        return "failed";
      }
      return "start";
    }
  };

  showPackages() {
    console.log(this.packages);
  }
  #inject(url) {
    if (/\.css$/.test(url)) {
      return this.#injectStyle(url);
    }
    return this.#injectScript(url);
  }

  #injectScript(url) {
    console.time("耗时");
    const scrpit = document.createElement("script");
    scrpit.src = url;
    scrpit.id = `installer_${url}`;
    scrpit.onload = () => {
      const Info = `脚本 ${url} `;
      console.log(` ${Info}，即将删除脚本`);
      console.timeEnd("耗时");
      this.packages.push({ type: "script", src: url });
    };
    document.body.appendChild(scrpit);
    document.body.removeChild(script);
    return `done`;
  }
  #injectStyle(url) {
    const link = document.createElement("link");
    link.href = url;
    link.rel = "stylesheet";
    link.id = `installer_${url}`;
    link.onload = () => {
      const Info = `css sheet ${url}`;
      console.log(`加载完成 ${Info}`);
      console.timeEnd("耗时");
      this.packages.push({ type: "css sheet", src: url });
    };
    document.head.appendChild(link);
  }
  #_fetchByJsdelivr = async (packageName) => {
    try {
      const tempUrl = `https://cdn.jsdelivr.net/npm/${packageName}`;
      const access = await fetch(tempUrl);
      if (access.ok) {
        return { src: tempUrl, packageName, cdn: "jsdelivr" };
      }
      throw new Error();
    } catch (error) {
      console.log(`使用jsdeliver下载${packageName}失败`);
      throw new Error();
    }
  };

  #_fetchByCdnJs = async (packageName) => {
    try {
      const res = await fetch(
        `https://api.cdnjs.com/libraries/${packageName}`
      ).then((res) => res.json());
      if (!res.error) {
        return {
          src: res.latest,
          version: res.version,
          packageName,
          cdn: "cdnjs",
        };
      }

      throw new Error();
    } catch (error) {
      console.log(`使用cdnjs下载${packageName}失败,尝试使用jsdeliver`);
      throw new Error();
    }
  };

  #errorLog = (packageName) =>
    console.log(`发现${packageName}包不存在, 请检查包名是否正确`);

  // 实际操作安装函数
  #_install = (detail) => {
    const { src, version = "", packageName, cdn } = detail;

    console.time("耗时");
    console.log("加载中.... please wait a moment");
    const script = document.createElement("script");
    script.src = src;
    script.id = `installer_${packageName}`;
    script.onload = () => {
      const Info = `使用${cdn} - 加载了${packageName}${
        version ? `@${version}` : ""
      }`;
      console.log(`加载完成 ${Info}`);
      console.timeEnd("耗时");
      this.packages.push(detail);
    };
    document.body.appendChild(script);
    document.body.removeChild(script);
  };
}

let installer = new Installer();
let $i = installer.add;
$i.toString = () => "$i";
$i.packages = installer.packages;
window.install = $i;
