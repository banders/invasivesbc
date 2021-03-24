import React, { useCallback, useContext, useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Button, CircularProgress } from '@material-ui/core';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { DocType } from 'constants/database';
import { AnglerInterview } from 'models/angler-interview';
import { saveAnglerInterviewToDB, loadAnglerInterviewFromDB } from 'utils/anglerInterviewDataAccess';
import FormContainer, { IFormContainerProps } from 'components/form/FormContainer';
import { useDebouncedCallback } from 'use-debounce';

const InterviewForm: React.FC = (props: any) => {
  const initialAnglerInterviewId = props.match.params.anglerInterviewId;

  const databaseContext = useContext(DatabaseContext);
  const history = useHistory();

  var [anglerInterviewId, setAnglerInterviewId] = useState<string>(initialAnglerInterviewId);
  var [isSaving, setIsSaving] = useState<boolean>(false);
  var [workInProgressFormData, setWorkInProgressFormData] = useState();
  
  const [schemas, setSchemas] = useState<{ schema: any; uiSchema: any }>({ 
    schema: {
          "title": "Angler interview",
          "description": null,
          "type": "object",          
          "properties": {  

            "interviewDatetime": {
              "title": "Date and time of interview",
              "type": "string",
              "format": "date-time",
              "default": new Date().toString()
            },

            "waterbodyAndLocation": {
              "title": "Location",
              "type": "object",
              "properties": {
                "waterbody": {
                  "type": "string",
                  "enum": [
                    "Bull",    
                    "Duncan",            
                    "Elk",
                    "Findlay",
                    "Lissier",
                    "Michel",
                    "Salmo",
                    "Skookumchuck",
                    "St. Mary",
                    "Kootenay",
                    "Upper Kootenay",                
                    "White",
                    "Wigwam",
                    "Wildhorse"
                  ]          
                },
                "locationDescription": {
                  "title": "Location description",
                  "type": "string"
                }
              },
              "required": [
                "waterbody"
              ],
              "dependencies": {
                "waterbody": {
                  "oneOf": [            
                    {
                      "properties": {
                        "waterbody": {
                          "enum": [
                            "Bull"
                          ]
                        },
                        "locationName": {
                          "title": "Location",
                          "type": "string",
                          "enum": [
                            "Aberfeldie Dam to Van Creek Confluence",
                            "Van Creek Confluence to Galbraith Creek Confluence",
                            "Galbraith Creek Confluence to Headwaters",
                            "Elko Dam to Morrissey FSR Bridge"
                          ]
                        }
                      }
                    },                    
                    {
                      "properties": {
                        "waterbody": {
                          "enum": [
                            "Elk"
                          ]
                        },
                        "location-description": {
                          "title": "Location",
                          "type": "string",
                          "enum": [
                            "Elko Dam to Morrissey FSR Bridge",
                            "Koocanusa to Elko Dam",
                            "Morrissey FSR Bridge to North Fernie Hwy Bridge",
                            "North Fernie Hwy bridge to Hosmer Hwy Bridge",
                            "Kootenay River to Sandown Creek Confluence",
                            "Hosmer Hwy Bridge to Sparwood CN Bridge"
                          ]
                        }
                      }
                    },
                    {
                      "properties": {
                        "waterbody": {
                          "enum": [
                            "Skookumchuck"
                          ]
                        },
                        "location-description": {
                          "title": "Location Description",
                          "type": "string",
                          "enum": [
                            "Galbraith Creek Confluence to Headwaters",
                            "Koocanusa to Elko Dam",
                            "Sandown Creek Confluence to Headwaters",
                            "Kootenay River to Sandown Creek Confluence"
                          ]
                        }
                      }
                    },
                    {
                      "properties": {
                        "waterbody": {
                          "enum": [
                            "Upper Kootenay"
                          ]
                        },
                        "location-description": {
                          "title": "Location Description",
                          "type": "string",
                          "enum": [
                            "White River Confluence to Headwaters (class II)",
                          ]
                        }
                      }
                    }            
                  ]
                }
              }
            },

            "infractions": {
              "title": "Infractions",
              "type": "object",
              "properties": {
                "hadInfractions": {
                  "title": "Infractions?",
                  "type": "string",
                  "enum": [
                    "Yes",    
                    "No"
                  ],
                  "default": "No"       
                }
              },
              "required": [
                "hadInfractions"
              ],
              "dependencies": {
                "hadInfractions": {
                  "oneOf": [            
                    {
                      "properties": {
                        "hadInfractions": {
                          "enum": [
                            "Yes"
                          ]
                        },
                        "infractionType": {
                          "type": "array",
                          "title": "Types of infractions",
                          "items": {
                            "type": "string",
                            "enum": [
                              "failure to produce",
                              "illegal bait",
                              "illegal harvest",
                              "treble hook",
                              "barbed hook",
                              "no class II"
                            ]
                          },
                          "uniqueItems": true
                        },
                        "ticketIssued": {
                          "title": "Ticket issued?",
                          "type": "string",
                          "enum": [
                            "Yes",
                            "No"
                          ],
                          "default": "No"
                        },
                        "ticketNumber": {
                          "title": "Ticket number",
                          "type": "string"                          
                        }
                      }
                    }           
                  ]
                }
              }
            },

            "guide": {
              "title": "Guide information",
              "type": "object",
              "properties": {
                "isGuided": {
                  "title": "Guided?",
                  "type": "string",
                  "enum": [
                    "Yes",    
                    "No"
                  ],
                  "default": "No"      
                }
              },
              "required": [
                "isGuided"
              ],
              "dependencies": {
                "isGuided": {
                  "oneOf": [            
                    {
                      "properties": {
                        "isGuided": {
                          "enum": [
                            "Yes"
                          ]
                        },
                        "guideName": {
                          "title": "Guide name",
                          "type": "string"                          
                        },
                        "assistantGuide": {
                          "title": "Assistant guide name",
                          "type": "string"                          
                        },
                        "guideCompany": {
                          "title": "Guide company",
                          "type": "string"                          
                        },
                        "guideLicenseNumber": {
                          "title": "Guide license number",
                          "type": "string"                          
                        },
                        "assistantGuideLicenseNumber": {
                          "title": "Assistant guide license number",
                          "type": "string"                          
                        }
                      }
                    }           
                  ]
                }
              }
            },

            "angler": {
              "title": "Angler information",
              "type": "object",
              "properties": {
                "anglerBasicLicenseNumber": {
                  "title": "Basic license number",
                  "type": "string"                          
                },
                "anglerBasicLicenseType": {
                  "title": "Basic license type",
                  "type": "string",
                  "enum":[
                    "Annual Angling Licence",
                    "One Day Angling Licence",
                    "Eight Day Angling Licence",
                    "Annual Licence for Disabled",
                    "Annual Licence for Age 65 Plus",
                    "BC First Nations",
                    "Under 16"
                  ]
                },
                "anglerClassIILicenseNumber": {
                  "title": "Class II license number",
                  "type": "string"                          
                },    
                "anglerName": {
                  "title": "Angler name",
                  "type": "string"                          
                },
                "anglerExpertise": {
                  "title": "Expertise",
                  "type": "string",
                  "$ref": "#/definitions/threePointScale",                      
                }, 
                "anglerSystemKnowledge": {
                  "title": "System knowledge",
                  "type": "string",
                  "$ref": "#/definitions/threePointScale",                     
                },             
                "anglerCountry": {
                  "title": "Country",
                  "type": "string",
                  "default": "Canada"                     
                },                              
              },
              "required": [
                "anglerCountry"
              ],
              "dependencies": {
                "anglerCountry": {
                  "oneOf": [            
                    {
                      "properties": {
                        "anglerCountry": {
                          "pattern": "Canada"
                        },
                        "anglerProvinceState": {
                          "title": "Province",
                          "type": "string",
                          "enum": [
                            "Alberta",
                            "British Columbia"
                          ], 
                          "default": "British Columbia"              
                        },
                        "anglerCity": {
                          "title": "City",
                          "type": "string"                          
                        }                      
                      }
                    }           
                  ]
                }
              }
            },


            "angling": {
              "title": "Angling",
              "type": "object",
              "properties": {
                "method": {
                  "title": "Angling method",
                  "type": "string",
                  "enum": [
                    "Gear",
                    "Fly"
                  ]                         
                },
                "targetSpecies": {
                  "title": "Target species",                  
                  "type": "array",                  
                  "items": {
                    "$ref": "#/definitions/species"
                  },
                  "uniqueItems": true                  
                }    
              }
            },
            
            "catches": {
              "title": "Catches",
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "species": {
                    "title": "Species",
                    "$ref": "#/definitions/species"
                  },
                  "numHarvested": {
                    "title": "# harvested",
                    "type": "number",
                    "default": 0
                  },
                  "numReleased": {
                    "title": "# released",
                    "type": "number",
                    "default": 0
                  }
                }                
              }  
            },

           "trip": {
              "title": "Trip",
              "type": "object",
              "properties": {
                "method": {
                  "title": "Access method",
                  "type": "string",
                  "enum": [
                    "Boat",
                    "Foot"
                  ]                   
                },
                "startTime": {
                  "title": "Start time",
                  "type": "string",
                  "format": "date-time",
                  "default": new Date().toString()                                 
                }, 
                "endTime": {
                  "title": "End time (or expected end time)",
                  "type": "string",
                  "format": "date-time",
                  "default": new Date().toString()                                
                },  
                "anglingQuality": {
                  "title": "Angling quality",
                  "description": "1=low quality, 5=high quality",
                  "$ref": "#/definitions/fivePointScale",                                      
                }, 
                "abundanceOfAnglers": {
                  "title": "Abundance of anglers",
                  "$ref": "#/definitions/threePointScale",                                      
                }, 
                "crowding": {
                  "title": "Crowding",
                  "$ref": "#/definitions/threePointScale",                                      
                },                                               
              }
            },

            "guardianNotes": {
              "title": "Guardian notes",
              "properties": {
                "otherNotes": {
                  "title": "Other comments",
                  "type": "string"
                }
              }              
            },

          //SCHEMA DEFINITIONS
          },
          "definitions": {
            "species": {              
              "type": "string",
              "enum": [
                "Bull Trout",
                "Kokanee",
                "Mountain Whitefish",
                "Rainbow Trout",
                "Westslope Cutthroat Trout"
              ]
            },
            "threePointScale": {
              "type": "string",
              "enum": [
                "Low",
                "Moderate",
                "High",                
                "Not specified"
              ],
              "default": "Not specified"
            },
            "fivePointScale": {
              "type": "string",
              "enum": [
                "1",
                "2",
                "3",
                "4",
                "5",
                "Not specified"
              ],
              "default": "Not specified"
            }
          }

        }, 

        uiSchema: {
          "waterbodyAndLocation": {
            "ui:order": [              
              "waterbody",
              "*",
              "locationDescription"
            ],
            "waterbody": {
              "ui:autofocus": true,
              "ui:emptyValue": "",
              "ui:autocomplete": "family-name"
            },            
          },          
          "angler": {
            "ui:order": [              
              "*",
              "anglerName",
              "anglerExpertise",
              "anglerSystemKnowledge"
            ],
            "anglerExpertise": {
              "ui:widget": "radio",
              "ui:options": {
                "inline": true
              }
            },
            "anglerSystemKnowledge": {
              "ui:widget": "radio",
              "ui:options": {
                "inline": true
              }
            },            
          },
          "trip": {
            "anglingQuality": {
              "ui:widget": "radio",
              "ui:options": {
                "inline": true
              }
            },
            "abundanceOfAnglers": {
              "ui:widget": "radio",
              "ui:options": {
                "inline": true
              }
            }, 
            "crowding": {
              "ui:widget": "radio",
              "ui:options": {
                "inline": true
              }
            }, 
          },
          "catches": {
            "ui:title": "Catches",
            "ui:description": "Tap the 'Add Item' button to the right to add a catch",
          }
          
        } 
      });

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        display: 'flex',
        alignItems: 'center',
      },
      page: {
        marginBottom: "30px"
      },
      wrapper: {
        margin: theme.spacing(1),
        position: 'relative',
      },
      buttonProgress: {
        position: 'absolute',
        left: 0        
      },
    }),
  );
  const classes = useStyles();

  const initAnglerInterview = async () => {
    console.log("init: "+anglerInterviewId)
    var initialAnglerInterview = null;
    if (anglerInterviewId) {
      try {
        initialAnglerInterview = await loadAnglerInterviewFromDB(databaseContext, anglerInterviewId)   
        console.log(initialAnglerInterview)
      }
      catch (e) {
        if (e.status == 404) {
          history.push("/page-not-found");          
          return;
        }
      }      
    }
    const formData = initialAnglerInterview ? initialAnglerInterview.formData || {} : {};
    setWorkInProgressFormData(formData);  
    
  };  

  useEffect(() => { 
    initAnglerInterview();   
  }, [databaseContext.database]);

  const debouncedSave = useDebouncedCallback(
      (formData: any, anglerInterviewIdToSave?: string) => { 
        save(formData, anglerInterviewIdToSave) 
      }, 
      1000    
  );

  const save = useCallback(async (formData: any, anglerInterviewIdToSave?: string) => {
    setIsSaving(true)
    //console.log(formData)
    console.log("save: "+anglerInterviewIdToSave); 
    const anglerInterview: AnglerInterview = new AnglerInterview({_id: anglerInterviewIdToSave, formData: formData})
    const savedAnglerInterview = await saveAnglerInterviewToDB(databaseContext, anglerInterview);  
    //console.log("before: "+anglerInterviewId);
    setAnglerInterviewId(savedAnglerInterview._id);
    //console.log("after: "+anglerInterviewId);
    setIsSaving(false)
    setWorkInProgressFormData(savedAnglerInterview.formData)
  }, [databaseContext.database]);

  const onFormChange = (data) => {
    //console.log("form changed")
    //console.log(data.formData);
    workInProgressFormData = data.formData; //update the state variable, but prevent re-render
    if (anglerInterviewId) {
      debouncedSave(workInProgressFormData, anglerInterviewId)  
    }
    
  }

  //don't show the form until these prerequisites are met:
  // - schema and uischema are ready
  // - initial form data are ready
  const isFormDataInitComplete = initialAnglerInterviewId == null || (initialAnglerInterviewId != null && workInProgressFormData != null);
  const areSchemasReady = schemas.schema && schemas.uiSchema;
  const isReady = isFormDataInitComplete && areSchemasReady;
  if (!isReady) {
    return <CircularProgress />;
  }

  //console.log(initialFormData)


  return (
  	<div>
    	
      <FormContainer {...{  
        schema: schemas.schema,
        uiSchema: schemas.uiSchema,
        initialFormData: workInProgressFormData,
        onFormChange: onFormChange,
        anglerInterview: null, 
        isDisabled: false }} />
      
    	<Button 
        variant="contained" 
        color="primary" 
        disabled={isSaving}
        onClick={() => save(workInProgressFormData, anglerInterviewId)}
        style={{marginBottom: "40px"}}>
        { isSaving ? "Saving..." : "Save" }        
      </Button>
      
      
      
    </div>
  );
};

export default InterviewForm;