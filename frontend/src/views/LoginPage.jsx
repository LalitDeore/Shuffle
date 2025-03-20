/* eslint-disable react/no-multi-comp */
import React, { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { useNavigate, Link, useParams } from "react-router-dom";
import { isMobile } from "react-device-detect";
import { toast } from "react-toastify";
import { useInterval } from "react-powerhooks";

import {
  ConnectingAirportsOutlined,
  ConstructionOutlined,
  DoneRounded,
  Done as DoneIcon,
} from "@mui/icons-material";

import {
  Checkbox,
  CircularProgress,
  TextField,
  Button,
  Paper,
  Typography,
  Tooltip,
  TableHead,
  TableRow,
  TableContainer,
  TableCell,
  TableBody,
  Table,
} from "@mui/material";

const hrefStyle = {
  color: "#FF8444",
  fontSize: "14px",
  textDecoration: "none",
  display: "flex",
};

const googleLoginIcon = {
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "16px",
  gap: "8px",
  // position: "sticky",
  width: 171,
  height: "51px",
  left: "352px",
  top: "725px",
  background: "#1A1A1A",
  border: "1px solid #494949",
  borderRadius: "8px",
};

const githubLoginIcon = {
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "16px",
  gap: "8px",
  position: "sticky",
  width: "173px",
  height: "51px",
  left: "539px",
  top: "725px",
  backgroundColor: "#1A1A1A",
  border: "1px solid #494949",
  borderRadius: "8px",
};

const surfaceColor = "#27292D";
const inputColor = "#383B40";

const useStyles = makeStyles({
  notchedOutline: {
    borderColor: "#f85a3e !important",
  },
  marketplaceButton: {
    width: "100%",
    justifyContent: "flex-start",
    padding: "12px",
    marginBottom: "12px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #494949",
    borderRadius: "8px",
    color: "white",
    opacity: 0.7,
    "&:hover": {
      opacity: 1,
      cursor: "not-allowed",
    },
  },
  marketplaceIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "0 20px",
    "&::before, &::after": {
      content: '""',
      flex: 1,
      borderBottom: "1px solid #494949",
    },
    "& span": {
      margin: "0 10px",
      color: "#9E9E9E",
    },
  },
  freePlanCard: {
    padding: "40px",
    background: "#212121",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "500px",
  },
  freePlanTitle: {
    fontSize: "28px",
    fontWeight: 600,
    color: "white",
    marginTop: 0,
    marginBottom: "32px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
    color: "white",
    fontSize: "16px",
    fontWeight: 500,
  },
  checkIcon: {
    color: "#4CAF50",
    marginRight: "16px",
    width: "24px",
    height: "24px",
  },
});

const FreePlanCard = ({ classes }) => {
  const features = [
    "Access to All Apps",
    "10,000 App Runs",
    "Monthly Runs Refresh",
    "Unlimited Users & Workflows",
    "Multi-Tenancy & -Region",
    "Support & Discord Access",
  ];

  return (
    <div className={classes.freePlanCard}>
      <h2 className={classes.freePlanTitle}>The free plan includes:</h2>

      {features.map((feature, index) => (
        <div key={index} className={classes.featureItem}>
          <DoneRounded className={classes.checkIcon} />
          <span>{feature}</span>
        </div>
      ))}
    </div>
  );
};

const MarketplaceCard = ({ classes }) => {
  const marketplaceOptions = [
    {
      name: "Amazon Web Services",
      logo: "https://cdn.cdnlogo.com/logos/a/19/aws.svg",
      tooltipText: "Coming soon to AWS Marketplace!",
      valid: false,
    },
    {
      name: "Microsoft Azure",
      logo: "https://cdn.cdnlogo.com/logos/a/12/azure.svg",
      tooltipText: "Coming soon to Azure Marketplace!",
      valid: false,
    },
    {
      name: "Google Cloud Platform",
      logo: "https://cdn.cdnlogo.com/logos/g/75/google-cloud.svg",
      tooltipText: "Coming soon to Google Cloud Marketplace!",
      valid: false,
    },
  ];

  return (
    <div
      style={{
        padding: "40px",
        background: "#212121",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "500px",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "32px",
          fontSize: "28px",
          fontWeight: 600,
          color: "white",
          textAlign: "center",
        }}
      >
        Self Host
      </h2>

      {marketplaceOptions.map((option, index) => (
        <Tooltip key={index} title={option.tooltipText} placement="top" arrow>
          <button className={classes.marketplaceButton} disabled>
            <img
              src={option.logo}
              alt={option.name}
              className={classes.marketplaceIcon}
              style={{
                filter: option.valid === true ? null : "grayscale(1)",
              }}
            />
            <Typography className={classes.marketplaceText}>
              {option.name}
            </Typography>
          </button>
        </Tooltip>
      ))}

      <div
        style={{
          marginTop: "0.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          textAlign: "center",
        }}
      >
        {/*
				<a
					href="https://shuffler.io/docs/configuration#marketplace-setup"
					target="_blank"
					style={{ color: "rgba(255, 132, 68, 1)", textDecoration: "underline" }}
				>
					Read more about marketplaces
				</a>
				*/}
        <a
          href="/docs/configuration#installing-shuffle"
          target="_blank"
          style={{
            color: "rgba(255, 132, 68, 1)",
            textDecoration: "underline",
          }}
        >
          Learn more about self hosting
        </a>
      </div>
    </div>
  );
};

const LoginPage = (props) => {
  const {
    globalUrl,
    isLoaded,
    isLoggedIn,
    setIsLoggedIn,
    setCookie,
    inregister,
    serverside,
    checkLogin,
  } = props;
  let navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [MFAField, setMFAField] = useState(false);
  const [MFAValue, setMFAValue] = useState("");
  const [register, setRegister] = useState(inregister);
  const [checkboxClicked, setCheckboxClicked] = useState(false);
  const [loginWithSSO, setLoginWithSSO] = useState(false);

  const [ssoUrl, setSSOUrl] = useState("");

  const isCloud =
    window.location.host === "localhost:3002" ||
    window.location.host === "shuffler.io" ||
    window.location.host === "migration.shuffler.io";
  const parsedsearch = serverside === true ? "" : window.location.search;

  useEffect(() => {
    if (!isCloud) {
      checkAdmin();
    }
  }, []);

  const { start, stop } = useInterval({
    duration: 3000,
    startImmediate: false,
    callback: () => {
      checkAdmin();
    },
  });

  if (serverside !== true) {
    const tmpMessage = new URLSearchParams(window.location.search).get(
      "message"
    );
    if (
      tmpMessage !== undefined &&
      tmpMessage !== null &&
      message !== tmpMessage
    ) {
      setMessage(tmpMessage);
    }
  }

  if (document !== undefined) {
    if (register) {
      document.title = "Login to Shuffle SaaS";
    } else {
      document.title = "Register to Shuffle SaaS";
    }
  }

  // Just a way to force location loading properly
  // Register & login should be split :3
  if (window !== undefined) {
    const path = window.location.pathname;
    if (path.includes("/login") && register === false) {
      console.log("Should register instead of login!");
      setRegister(!register);
    } else if (path.includes("/register") && register === true) {
      if (!isCloud) {
        setRegister(true);
        navigate("/login");
      }

      console.log("Should login instead of register!");
      setRegister(!register);
    } else {
      console.log("Path: " + path, "Register: " + register);
    }
  }

  const bodyDivStyle = {
    marginTop: 100,
    width: isMobile ? "100%" : "100%",
    maxWidth: "1200px", // Increased max-width to accommodate larger cards
    background: "#1A1A1A",
    margin: "auto",
    display: isMobile ? "block" : "flex",
    padding: "40px",
    gap: "40px",
    overflow: "hidden",
    alignItems: "center",
  };

  const boxStyle = {
    color: "white",
    padding: "40px",
    flex: 1,
    maxWidth: isMobile ? "100%" : "550px",
    background: "#212121",
    borderRadius: "12px",
    display: "flex",
    // flexDirection: "column",
  };

  const paperStyleReg = {
    width: 300,
    height: 350,
    background: "#212121",
    borderRadius: "8px",
    marginLeft: isMobile ? 80 : register ? "455px" : "485px",
    marginTop: isMobile ? 10 : 110,
    position: isMobile ? "" : "absolute",
  };
  const paperStyleLog = {
    position: "absolute",
    width: isMobile ? "400px" : "532px",
    padding: "0px 30px 0px",
    // marginTop: "135px",
    // background: "#212121",
    borderRadius: "8px",
  };
  const createData = (icon, title) => {
    return {
      icon,
      title,
    };
  };

  // Used to swap from login to register. True = login, false = register
  const activeIcon = <DoneIcon style={{ color: "green" }} />;
  const rows = [
    createData(activeIcon, "Access to All Apps"),
    createData(activeIcon, "10,000 App Runs"),
    createData(activeIcon, "Monthly Runs Refresh"),
    createData(activeIcon, "Unlimited Users & Workflows"),
    createData(activeIcon, "Multi-Tenancy & -Region"),
    createData(activeIcon, "Support & Discord Access"),
  ];
  const classes = useStyles();
  // Error messages etc
  const [loginInfo, setLoginInfo] = useState("");

  const handleValidateForm = (username, password) => {
    if (loginWithSSO) {
      return username.length > 1;
    }

    if (!isCloud) {
      return username.length > 0 && password.length > 0;
    }

    return username.length > 1 && password.length > 8;
  };

  if (isLoggedIn === true && serverside !== true) {
    const tmpView = new URLSearchParams(window.location.search).get("view");
    if (tmpView !== undefined && tmpView !== null && tmpView === "pricing") {
      window.location.pathname = "/pricing";
      return;
    } else if (tmpView !== undefined && tmpView !== null) {
      window.location.pathname = tmpView;
      return;
    }

    window.location.pathname = "/workflows";
  }

  const checkAdmin = () => {
    const url = globalUrl + "/api/v1/checkusers";
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) =>
        response.json().then((responseJson) => {
          if (responseJson["success"] === false) {
            setLoginInfo(responseJson["reason"]);
          } else {
            if (
              responseJson.sso_url !== undefined &&
              responseJson.sso_url !== null
            ) {
              setSSOUrl(responseJson.sso_url);
            }

            // Stay = 0 users
            // Redirect = >1 user
            if (responseJson.reason === "stay") {
              setTimeout(() => {
                navigate("/adminsetup");
              }, 2500);
            }
          }
        })
      )
      .catch((error) => {
        setTimeout(() => {
          navigate("/adminsetup");
        }, 2500);
      });
  };

  const onSubmit = (e) => {
    //toast("Testing from login page")

    setMessage("");
    setLoginLoading(true);
    e.preventDefault();

    // Just use this one?
    var data = { username: username, password: password };
    if (MFAValue !== undefined && MFAValue !== null && MFAValue.length > 0) {
      data["mfa_code"] = MFAValue;
    }

    localStorage.setItem("globalUrl", "");

    var baseurl = globalUrl;
    if (register) {
      var url = baseurl + "/api/v1/login";

      if (loginWithSSO === true) {
        url = baseurl + "/api/v1/login/sso";
        setLoginInfo(
          "Logging in with SSO. Please wait while we find a relevant org..."
        );
      }

      fetch(url, {
        mode: "cors",
        method: "POST",
        body: JSON.stringify(data),
        credentials: "include",
        crossDomain: true,
        withCredentials: true,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      })
        .then((response) => {
          if (response.status !== 200) {
            console.log("Status not 200 for login:O!");
          }

          return response.json();
        })
        .then((responseJson) => {
          setLoginLoading(false);

          console.log("Resp from backend: ", responseJson);

          if (responseJson["success"] === false) {
            setLoginInfo(responseJson["reason"]);
          } else {
            if (responseJson["reason"] === "MFA_REDIRECT") {
              setLoginInfo("Enter the 6-digit MFA code.");
              setMFAField(true);
              return;
            } else if (responseJson["reason"] === "MFA_SETUP") {
              window.location.href = `/login/${responseJson.url}/mfa-setup`;
              return;
            } else if (responseJson["reason"] === "SSO_REDIRECT") {
              //navigate(responseJson["url"])
              window.location.href = responseJson["url"];
              return;
            } else if (
              responseJson["reason"] !== undefined &&
              responseJson["reason"] !== null &&
              responseJson["reason"].includes("error")
            ) {
              setLoginInfo(responseJson["reason"]);
              return;
            }

            setLoginInfo("Successful login! Redirecting you in 3 seconds...");
            for (var key in responseJson["cookies"]) {
              setCookie(
                responseJson["cookies"][key].key,
                responseJson["cookies"][key].value,
                { path: "/" }
              );
            }

            const tmpView = new URLSearchParams(window.location.search).get(
              "view"
            );
            if (tmpView !== undefined && tmpView !== null) {
              //const newUrl = `/${tmpView}${decodeURIComponent(window.location.search)}`
              // Check if slash in the url

              var newUrl = `/${tmpView}`;
              if (tmpView.startsWith("/")) {
                newUrl = `${tmpView}`;
              }

              console.log("Found url: ", newUrl);

              window.location.pathname = newUrl;
              return;
            }

            console.log("LOGIN DATA: ", responseJson);
            if (
              responseJson.tutorials !== undefined &&
              responseJson.tutorials !== null
            ) {
              // Find welcome in responseJson.tutorials under key name
              const welcome = responseJson.tutorials.find(function (element) {
                return element.name === "welcome";
              });

              console.log("Welcome: ", welcome);
              if (welcome === undefined || welcome === null) {
                console.log("RUN login Welcome!!");
                // window.location.pathname = "/welcome?tab=2"
                // window.location = "/welcome?tab=2"
                window.location.href = "/welcome?tab=2";
                return;
              }
            }

            window.location.pathname = "/workflows";
          }
        })
        .catch((error) => {
          setLoginInfo("Error from login API: " + error);
          setLoginLoading(false);
        });
    } else {
      url = baseurl + "/api/v1/register";
      fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) =>
          response.json().then((responseJson) => {
            if (responseJson["success"] === false) {
              setLoginInfo(responseJson["reason"]);
            } else {
              if (responseJson["reason"] === "shuffle_account") {
                window.location.href =
                  "/login?message=Please+login+with+your+Shuffle+account";
                return;
              }

              //setLoginInfo("Successful register!")
              //var newpath = "/login?message=Successfully signed up. You can now sign in."
              //const tmpMessage = new URLSearchParams(window.location.search).get("message")
              setLoginInfo(
                "Successful registration! Redirecting in 3 seconds..."
              );
              for (var key in responseJson["cookies"]) {
                setCookie(
                  responseJson["cookies"][key].key,
                  responseJson["cookies"][key].value,
                  { path: "/" }
                );
              }

              setTimeout(() => {
                console.log("LOGIN DATA: ", responseJson);

                const tmpView = new URLSearchParams(window.location.search).get(
                  "view"
                );
                if (tmpView !== undefined && tmpView !== null) {
                  //const newUrl = `/${tmpView}${decodeURIComponent(window.location.search)}`
                  const newUrl = `/${tmpView}`;
                  window.location.pathname = newUrl;
                  return;
                }

                //if (responseJson.tutorials === undefined || responseJson.tutorials === null || !responseJson.tutorials.includes("welcome")) {
                console.log("RUN Welcome!!");
                //window.location.pathname = "/welcome?tab=2"
                window.location.href = "/welcome";
              }, 1500);
            }
            setLoginLoading(false);
          })
        )
        .catch((error) => {
          setLoginInfo(
            "Error in login. Please try again, or contact support@shuffler.io if the problem persists."
          );
          setLoginLoading(false);
        });
    }
  };

  const onChangeUser = (e) => {
    setUsername(e.target.value);
  };

  const onChangePass = (e) => {
    setPassword(e.target.value);
  };

  const HandleLoginWithSSO = () => {
    setPassword("");
    setLoginInfo("");
    setLoginWithSSO(true);
  };

  //const onClickRegister = () => {
  //	if (props.location.pathname === "/login") {
  //		window.location.pathname = "/register"
  //	} else {
  //		window.location.pathname = "/login"
  //	}

  //	setLoginCheck(!register)
  //}

  //var loginChange = register ? (<div><p onClick={setLoginCheck(false)}>Want to register? Click here.</p></div>) : (<div><p onClick={setLoginCheck(true)}>Go back to login? Click here.</p></div>);
  var formtitle = register ? <div>Login</div> : <div>Register</div>;
  const imgsize = 100;
  const basedata = (
    <div style={bodyDivStyle}>
      <Paper
        style={{
          paddingLeft: "30px",
          paddingRight: "30px",
          paddingBottom: "30px",
          paddingTop: "30px",
          position: "relative",
          backgroundColor: theme.palette.surfaceColor,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -imgsize / 2 - 10,
            left: 250 - imgsize / 2,
            height: imgsize,
            width: imgsize,
          }}
        >
          <img
            src="images/Shuffle_logo.png"
            style={{
              height: imgsize + 10,
              width: imgsize + 10,
              border: "2px solid rgba(255,255,255,0.6)",
              borderRadius: imgsize,
            }}
          />
        </div>

        {loginViewLoading ? (
          <div style={{ textAlign: "center", marginTop: 50 }}>
            <Typography
              variant="body2"
              style={{ marginBottom: 20, color: "white" }}
            >
              Waiting for the Shuffle database to become available. This may
              take up to a minute.
            </Typography>

            {loginInfo === undefined ||
            loginInfo === null ||
            loginInfo.length === 0 ? null : (
              <div style={{ marginTop: "10px" }}>
                Database Response: {loginInfo}
              </div>
            )}
            <CircularProgress color="secondary" style={{ color: "white" }} />

            <Paper
              style={{
                paddingLeft: "30px",
                paddingRight: "30px",
                paddingBottom: "30px",
                paddingTop: "30px",
                position: "relative",
                textAlign: "left",
                marginTop: 15,
              }}
            >
              <Typography
                variant="body2"
                style={{ marginBottom: 20, color: "white" }}
              >
                <b>
                  Are you sure Shuffle is{" "}
                  <a
                    rel="norefferer"
                    target="_blank"
                    href="https://github.com/frikky/Shuffle/blob/master/.github/install-guide.md"
                    style={{ textDecoration: "none", color: "#f86a3e" }}
                  >
                    installed correctly
                  </a>
                  ?
                </b>
              </Typography>
              <Typography
                variant="body2"
                style={{ marginBottom: 20, color: "white" }}
              >
                <b>1.</b> Make sure shuffle-database folder has correct access,
                and that you have a minimum of <b>2Gb of RAM available</b>:{" "}
                <br />
                <br />
                sudo chown -R 1000:1000 shuffle-database
              </Typography>
              <Typography
                variant="body2"
                style={{ marginBottom: 20, color: "white" }}
              >
                <b>2.</b> Disable memory swap on the host:
                <br />
                <br />
                sudo swapoff -a
              </Typography>
              <Typography
                variant="body2"
                style={{ marginBottom: 20, color: "white" }}
              >
                <b>3</b>. Restart the database:
                <br />
                <br />
                sudo docker restart shuffle-opensearch
              </Typography>
            </Paper>
            <Typography
              variant="body2"
              style={{ marginBottom: 10, color: "white", marginTop: 20 }}
            >
              Need help?{" "}
              <a
                rel="norefferer"
                target="_blank"
                href="https://discord.gg/B2CBzUm"
                style={{ textDecoration: "none", color: "#f86a3e" }}
              >
                Join the Discord!
              </a>
            </Typography>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            style={{ margin: "15px 15px 15px 15px", color: "white" }}
          >
            <h2>{formtitle}</h2>
            Username
            <div>
              <TextField
                color="primary"
                style={{
                  backgroundColor: theme.palette.inputColor,
                  marginTop: 5,
                }}
                autoFocus
                InputProps={{
                  classes: {
                    notchedOutline: classes.notchedOutline,
                  },
                  style: {
                    height: "50px",
                    color: "white",
                    fontSize: "1em",
                  },
                }}
                required
                fullWidth={true}
                autoComplete="username"
                placeholder="username@example.com"
                id="emailfield"
                margin="normal"
                variant="outlined"
                onChange={onChangeUser}
              />
            </div>
            Password
            <div>
              <TextField
                color="primary"
                style={{
                  backgroundColor: theme.palette.inputColor,
                  marginTop: 5,
                }}
                InputProps={{
                  classes: {
                    notchedOutline: classes.notchedOutline,
                  },
                  style: {
                    height: "50px",
                    color: "white",
                    fontSize: "1em",
                  },
                }}
                required
                id="outlined-password-input"
                fullWidth={true}
                type="password"
                autoComplete="current-password"
                placeholder="**********"
                margin="normal"
                variant="outlined"
                onChange={onChangePass}
              />
            </div>
            {MFAField === true ? (
              <div style={{ marginTop: 15 }}>
                2-factor code
                <TextField
                  color="primary"
                  style={{
                    backgroundColor: theme.palette.inputColor,
                    marginTop: 5,
                  }}
                  InputProps={{
                    classes: {
                      notchedOutline: classes.notchedOutline,
                    },
                    style: {
                      height: "50px",
                      color: "white",
                      fontSize: "1em",
                    },
                  }}
                  required
                  id="outlined-password-input"
                  fullWidth={true}
                  type="text"
                  placeholder="6-digit code"
                  margin="normal"
                  variant="outlined"
                  onChange={(event) => {
                    setMFAValue(event.target.value);
                  }}
                />
              </div>
            ) : null}
            <div style={{ display: "flex", marginTop: "15px" }}>
              <Button
                color="primary"
                variant="contained"
                type="submit"
                id="loginButton"
                style={{ flex: "1" }}
                disabled={!handleValidateForm() || loginLoading}
              >
                {loginLoading ? (
                  <CircularProgress
                    color="secondary"
                    style={{ color: "white" }}
                  />
                ) : (
                  "SUBMIT"
                )}
              </Button>
            </div>
            <div style={{ marginTop: "10px" }}>{loginInfo}</div>
            {ssoUrl !== undefined && ssoUrl !== null && ssoUrl.length > 0 ? (
              <div>
                <Typography style={{ textAlign: "center" }}>Or</Typography>
                <div style={{ textAlign: "center", margin: 10 }}>
                  <Button
                    fullWidth
                    id="sso_button"
                    color="secondary"
                    variant="outlined"
                    type="button"
                    style={{ flex: "1", marginTop: 5 }}
                    onClick={() => {
                      //console.log("CLICK SSO");
                      window.location.href = ssoUrl;
                      //navigate(ssoUrl)
                    }}
                  >
                    Use SSO
                  </Button>
                </div>
              </div>
            ) : null}
          </form>
        )}
      </Paper>
    </div>
  );

  const loadedCheck = isLoaded ? <div>{basedata}</div> : <div></div>;

  return (
    <div style={{ zoom: 0.8, paddingTop: 75, paddingBottom: 90 }}>
      {loadedCheck}
    </div>
  );
};

export default LoginPage;
