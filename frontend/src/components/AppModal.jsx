import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Button,
  Stack,
  Avatar,
  Skeleton,
  Tooltip,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import Search from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ForkRightIcon from '@mui/icons-material/ForkRight';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LaunchIcon from '@mui/icons-material/Launch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CloudDownloadOutlined } from '@mui/icons-material';
import { findSpecificApp } from '../components/AppFramework.jsx';
import theme from "../theme.jsx";
import YAML from 'yaml';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const AppModal = ({ open, onClose, app, globalUrl }) => {

  const [frameworkData, setFrameworkData] = useState({})
  const [userdata, setUserdata] = useState({})
  const [usecases, setUsecases] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [prevSubcase, setPrevSubcase] = useState({})
  const [inputUsecase, setInputUsecase] = useState({})
  const [latestUsecase, setLatestUsecase] = useState([])
  const [foundAppUsecase, setFoundAppUsecase] = useState({})
  const [usecaseLoading, setUsecaseLoading] = useState(false)
  const navigate = useNavigate();
  const parseUsecase = (subcase) => {
    const srcdata = findSpecificApp(frameworkData, subcase.type)
    const dstdata = findSpecificApp(frameworkData, subcase.last)

    if (srcdata !== undefined && srcdata !== null) {
      subcase.srcimg = srcdata.large_image
      subcase.srcapp = srcdata.name
    }

    if (dstdata !== undefined && dstdata !== null) {
      subcase.dstimg = dstdata.large_image
      subcase.dstapp = dstdata.name
    }
    return subcase
  }

  useEffect(() => {
    var baseurl = globalUrl;
    fetch(baseurl + "/api/v1/me", {
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.success) {
          setUserdata(responseJson)
        }
      })
      .catch(error => {
        console.log("Failed login check: ", error);
      });
  }, [app]);


  const getFramework = () => {
    fetch(globalUrl + "/api/v1/apps/frameworkConfiguration", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        if (response.status !== 200) {
          console.log("Status not 200 for framework!");
        }

        return response.json();
      })
      .then((responseJson) => {
        if (responseJson.success === false) {
          const preparedData = {
            "siem": findSpecificApp({}, "SIEM"),
            "communication": findSpecificApp({}, "COMMUNICATION"),
            "assets": findSpecificApp({}, "ASSETS"),
            "cases": findSpecificApp({}, "CASES"),
            "network": findSpecificApp({}, "NETWORK"),
            "intel": findSpecificApp({}, "INTEL"),
            "edr": findSpecificApp({}, "EDR"),
            "iam": findSpecificApp({}, "IAM"),
            "email": findSpecificApp({}, "EMAIL"),
          }

          setFrameworkData(preparedData)
        } else {
          setFrameworkData(responseJson)
        }
      })
      .catch((error) => {
        console.log("Error getting framework: ", error)
      })
  }

  const fetchUsecases = (workflows) => {
    fetch(globalUrl + "/api/v1/workflows/usecases", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        if (response.status !== 200) {
          console.log("Status not 200 for usecases");
        }

        return response.json();
      })
      .then((responseJson) => {


        const newUsecases = [...usecases]
        newUsecases.forEach((category, index) => {
          category.list.forEach((subcase, subindex) => {
            getUsecase(subcase, index, subindex)
          })
        })

        setLatestUsecase(newUsecases)
        if (newUsecases?.length > 0) {
          const foundCategory = newUsecases?.find((category) =>
            category?.list?.some((subcase) => subcase?.srcapp === app?.name || subcase?.dstapp === app?.name)
          );
    
          const foundSubcase = foundCategory?.list?.find(
            (subcase) => subcase?.srcapp === app?.name || subcase?.dstapp === app?.name
          );
    
          setFoundAppUsecase(foundSubcase);
        }
        setUsecaseLoading(false)

        // Matching workflows with usecases
        if (responseJson.success !== false) {
          if (workflows !== undefined && workflows !== null && workflows.length > 0) {
            var categorydata = responseJson

            var newcategories = []
            for (var key in categorydata) {
              var category = categorydata[key]
              category.matches = []

              for (var subcategorykey in category.list) {
                var subcategory = category.list[subcategorykey]
                subcategory.matches = []

                for (var workflowkey in workflows) {
                  const workflow = workflows[workflowkey]

                  if (workflow.usecase_ids !== undefined && workflow.usecase_ids !== null) {
                    for (var usecasekey in workflow.usecase_ids) {
                      if (workflow.usecase_ids[usecasekey].toLowerCase() === subcategory?.name?.toLowerCase()) {

                        category.matches.push({
                          "workflow": workflow.id,
                          "category": subcategory?.name,
                        })

                        subcategory.matches.push(workflow)
                        break
                      }
                    }
                  }

                  if (subcategory.matches.length > 0) {
                    break
                  }
                }
              }

              newcategories.push(category)
            }

            if (newcategories !== undefined && newcategories !== null && newcategories.length > 0) {
              setUsecases(newcategories)
            } else {
              setUsecases(responseJson)
            }
          } else {
            setUsecases(responseJson)
          }
        }
      })
      .catch((error) => {
        //toast("ERROR: " + error.toString());
        console.log("ERROR: " + error.toString());
      });
  };

  const getAvailableWorkflows = () => {
    fetch(globalUrl + "/api/v1/workflows", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        if (response.status !== 200) {
          fetchUsecases()
          console.log("Status not 200 for workflows :O!: ", response.status);
          return;
        }

        return response.json();
      })
      .then((responseJson) => {
        fetchUsecases(responseJson)

        if (responseJson !== undefined) {
          setWorkflows(responseJson);
        }
      })
      .catch((error) => {
        fetchUsecases()
        //toast(error.toString());
      });
  }

  const getUsecase = (subcase, index, subindex) => {
    subcase = parseUsecase(subcase)
    setPrevSubcase(subcase)

    fetch(`${globalUrl}/api/v1/workflows/usecases/${escape(subcase?.name?.replaceAll(" ", "_"))}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        if (response.status !== 200) {
          console.log("Status not 200 for framework!");
        }

        return response.json();
      })
      .then((responseJson) => {
        var parsedUsecase = responseJson

        if (responseJson.success === false) {
          parsedUsecase = subcase
        } else {
          parsedUsecase = responseJson

          parsedUsecase.srcimg = subcase.srcimg
          parsedUsecase.srcapp = subcase.srcapp
          parsedUsecase.dstimg = subcase.dstimg
          parsedUsecase.dstapp = subcase.dstapp
        }
        // Look for the type of app and fill in img1, srcapp...
        setInputUsecase(parsedUsecase)
      })
      .catch((error) => {
        //toast(error.toString());
        setInputUsecase(subcase)
        console.log("Error getting usecase: ", error)
      })
  }



  useEffect(() => {
    setUsecaseLoading(true)
    getAvailableWorkflows()
    getFramework()
  }, [app])


  const downloadApp = (inputdata) => {
    const id = inputdata.id;

    toast("Downloading..");
    fetch(globalUrl + "/api/v1/apps/" + id + "/config", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        if (response.status !== 200) {
          window.location.pathname = "/apps";
        }

        return response.json();
      })
      .then((responseJson) => {
        if (!responseJson.success) {
          toast("Failed to download file");
        } else {
          console.log(responseJson);
          const basedata = atob(responseJson.openapi);
          console.log("BASE: ", basedata);
          var inputdata = JSON.parse(basedata);
          console.log("POST INPUT: ", inputdata);
          inputdata = JSON.parse(inputdata.body);

          const newpaths = {};
          if (inputdata["paths"] !== undefined) {
            Object.keys(inputdata["paths"]).forEach(function (key) {
              newpaths[key.split("?")[0]] = inputdata.paths[key];
            });
          }

          inputdata.paths = newpaths;
          console.log("INPUT: ", inputdata);
          var name = inputdata.info.title;
          name = name.replace(/ /g, "_", -1);
          name = name.toLowerCase();

          delete inputdata.id;
          delete inputdata.editing;

          const data = YAML.stringify(inputdata);
          var blob = new Blob([data], {
            type: "application/octet-stream",
          });

          var url = URL.createObjectURL(blob);
          var link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `${name}.yaml`);
          var event = document.createEvent("MouseEvents");
          event.initMouseEvent(
            "click",
            true,
            true,
            window,
            1,
            0,
            0,
            0,
            0,
            false,
            false,
            false,
            false,
            0,
            null
          );
          link.dispatchEvent(event);
          //link.parentNode.removeChild(link)
        }
      })
      .catch((error) => {
        console.log(error);
        toast(error.toString());
      });
  };

  const isCloud =
    window.location.host === "localhost:3002" ||
      window.location.host === "shuffler.io" || window.location.host === "localhost:3000"
      ? true
      : false;

  var newAppname = app?.name;
  if (newAppname === undefined) {
    newAppname = "Undefined";
  } else {
    newAppname = newAppname.charAt(0).toUpperCase() + newAppname.substring(1);
    newAppname = newAppname?.replaceAll("_", " ");
  }


  var canEditApp = userdata !== undefined && (userdata?.admin === "true" || userdata?.id === app?.owner || app?.owner === "" || (userdata?.admin === "true" && userdata?.active_org?.id === app?.reference_org)) || !app?.generated

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          border: "1px solid #494949",
          minWidth: '440px',
          fontFamily: theme?.typography?.fontFamily,
          backgroundColor: "#212121",
          '& .MuiDialogContent-root': {
            backgroundColor: "#212121",
          },
          '& .MuiDialogTitle-root': {
            backgroundColor: "#212121",
          },
          '& .MuiTypography-root': {
            fontFamily: theme?.typography?.fontFamily,
          },
          '& .MuiButton-root': {
            fontFamily: theme?.typography?.fontFamily,
          },
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          pt: 2,
          pl: 3,
          pr: 2,
          fontFamily: theme?.typography?.fontFamily
        }}
      >
        <Typography component="div" sx={{ fontWeight: 500, color: "#F1F1F1", fontSize: "20px" }}>
          About {app?.name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'space-between', justifyContent: 'space-between' }}>

          <div style={{ display: "flex", flexDirection: "row", gap: 10, fontFamily: theme?.typography?.fontFamily }}>
            <img
              alt={app?.name}
              src={app?.large_image || app?.image_url}
              style={{
                borderRadius: 4,
                maxWidth: 100,
                minWidth: 100,
                maxHeight: "100%",
                display: "block",
                margin: "0 auto",
                boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.2)"
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 8, }}>
              <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                  {newAppname}
                </Typography>
                <Link
                  to={"/apps/" + (app?.id || app?.objectID)}
                  style={{ textDecoration: "none", color: "#f85a3e", marginTop: "-2px" }}
                >
                  <IconButton
                    style={{
                      color: "#f85a3e",
                      fontSize: 16,
                    }}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </Link>
              </div>
              <Typography
                variant="body2"
                color="textSecondary"
              >
                {app?.categories ? app.categories.join(", ") : "Communication"}
              </Typography>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 }}>

            {app?.activated &&
              app?.private_id !== undefined &&
              app?.private_id?.length > 0 &&
              app?.generated ? (
              <Tooltip title="Download OpenAPI"
                placement="top"
                arrow
                sx={{
                  fontFamily: theme?.typography?.fontFamily
                }}
              >
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#494949',
                    '&:hover': { bgcolor: '#494949' },
                    textTransform: 'none',
                    borderRadius: 1,
                    minWidth: '45px',
                    width: '45px',
                    height: '40px',
                    padding: 2,
                    color: "#fff",
                    fontFamily: theme?.typography?.fontFamily
                  }}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    downloadApp(app);
                  }}
                >
                  <CloudDownloadOutlined />
                </Button>
              </Tooltip>
            ) : null}
            <Button
              variant="contained"
              sx={{
                bgcolor: "#494949",
                '&:hover': { bgcolor: '#494949' },
                textTransform: 'none',
                borderRadius: 1,
                py: 1,
                px: 3,
                height: '40px',
                color: "#fff",
                fontFamily: theme?.typography?.fontFamily
              }}
              startIcon={canEditApp ? <EditIcon /> :
                (app?.generated && app?.activated && userdata?.id !== app?.owner && isCloud ?
                  <ForkRightIcon /> : null
                )}
              onClick={() => {
                if (canEditApp) {
                  const editUrl = "/apps/edit/" + (app?.id || app?.objectID);
                  navigate(editUrl)
                } else {
                  const forkUrl = "/apps/new?id=" + (app?.id || app?.objectID);
                  navigate(forkUrl)
                }
              }}
            >
              {canEditApp ? "Edit" : "Fork"}
            </Button>
          </div>
        </Box>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: theme?.typography?.fontFamily,
          padding: "26px 0px"
        }}>
          <div style={{
            textAlign: "start",
            flex: 1,
          }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: theme?.typography?.fontFamily,
                fontSize: '24px',
                fontWeight: 600,
                mb: 0.3,
                color: '#fff'
              }}
            >
              20
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: theme?.typography?.fontFamily,
                fontSize: '14px'
              }}
            >
              Public Workflow
            </Typography>
          </div>
          <div style={{
            flex: 1,
            textAlign: "start",
            borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
            paddingLeft: "10px",
            height: "100%",
          }}>
            <Typography variant="h6"
              sx={{
                fontWeight: 600,
                mb: 0.3,
                color: '#fff'
              }}>
              {Array.isArray(app?.actions) ? app.actions.length : app?.actions}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Actions
            </Typography>
          </div>
          <div style={{
            borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
            flex: 1,
            paddingLeft: "10px",
            paddingTop: "5px"
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: "5px", fontFamily: theme?.typography?.fontFamily, fontSize: "14px", fontWeight: 600, color: 'white' }}>
              {
                app?.collection ? (
                  <>
                    <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                    <Typography variant="body1" sx={{
                      fontWeight: 500,
                      color: '#fff',
                      marginTop: "1px",
                      fontFamily: theme?.typography?.fontFamily,
                      fontSize: "16px"
                    }}>
                      app.collection

                    </Typography>
                  </>
                ) : (
                  <Typography sx={{
                    fontSize: "16px",
                    fontWeight: 500,
                    marginTop: "1px",
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: theme?.typography?.fontFamily
                  }}>
                    No collection yet
                  </Typography>
                )
              }

            </div>
            <Typography variant="body2" sx={{ color: 'rgba(158, 158, 158, 1)' }}>
              Part of a collection
            </Typography>
          </div>
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          width: "100%"
        }}>
          {usecaseLoading ? (
            <Skeleton 
              variant="text" 
              width="55%" 
              sx={{ 
                fontSize: "16px",
                mb: "16px",
              }} 
            />
          ) : (
            <div style={{
              fontFamily: theme?.typography?.fontFamily,
              fontSize: "16px",
              color: "#fff",
              marginBottom: "16px",
              fontWeight: 600
            }}>
              {
                (foundAppUsecase?.srcapp !== undefined && foundAppUsecase?.dstapp !== undefined) ? (
                  "Connect " + foundAppUsecase?.srcapp?.replaceAll("_", " ") + " to " + foundAppUsecase?.dstapp?.replaceAll("_", " ")
                ) : (
                  "Connect " + app?.name.replaceAll("_", " ") + " to any tool"
                )
              }
            </div>
          )}

          <Box sx={{
            bgcolor: '#2F2F2F',
            p: 2,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            mb: 3
          }}>
            {usecaseLoading ? (
              <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                <Stack direction="row" spacing={-1}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="circular" width={32} height={32} />
                </Stack>
                <Skeleton variant="text" sx={{ flexGrow: 1 }} width={200} />
              </Stack>
            ) : (
              <>
                <Stack direction="row" spacing={-1}>
                  {foundAppUsecase?.srcapp === undefined ? (
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }} src={app?.image_url || app?.large_image}>
                    </Avatar>
                  ) : (
                    <Avatar
                      src={foundAppUsecase?.srcimg}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        zIndex: 10
                      }}
                    />
                  )}
                  {foundAppUsecase?.dstapp === undefined ? (
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                      <AddIcon sx={{ color: 'text.primary', zIndex: 10, fontSize: 18 }} />
                    </Avatar>
                  ) : (
                    <Avatar
                      src={foundAppUsecase?.dstimg}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        zIndex: 10
                      }}
                    />
                  )}
                </Stack>
                <Typography sx={{ ml: 2, fontSize: "16px", letterSpacing: "0.5px" }}>
                  {foundAppUsecase?.name || "Search for a Usecase"}
                </Typography>
              </>
            )}
          </Box>
        </div>

        <div style={{ display: "flex", justifyContent: "center", fontFamily: theme?.typography?.fontFamily }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#FF8544',
              '&:hover': { bgcolor: '#FF8544' },
              textTransform: 'none',
              borderRadius: "4px",
              py: 1,
              px: 7,
              fontSize: "14px",
              letterSpacing: "0.5px",
              color: "black",
              fontFamily: theme?.typography?.fontFamily,
              minWidth: '200px'
            }}
            onClick={() => {
              navigate("/usecases")
            }}
            disabled={usecaseLoading}
          >
            {
              (foundAppUsecase !== undefined && foundAppUsecase !== null && usecaseLoading === false) ? "See usecase" : "Find a Usecase"
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppModal;
