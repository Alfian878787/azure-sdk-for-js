/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import * as msRest from "@azure/ms-rest-js";


export const InternalError: msRest.CompositeMapper = {
  serializedName: "InternalError",
  type: {
    name: "Composite",
    className: "InternalError",
    modelProperties: {
      code: {
        serializedName: "code",
        type: {
          name: "String"
        }
      },
      innererror: {
        serializedName: "innererror",
        type: {
          name: "Composite",
          className: "InternalError"
        }
      }
    }
  }
};

export const PersonalizerError: msRest.CompositeMapper = {
  serializedName: "PersonalizerError",
  type: {
    name: "Composite",
    className: "PersonalizerError",
    modelProperties: {
      code: {
        required: true,
        serializedName: "code",
        type: {
          name: "String"
        }
      },
      message: {
        required: true,
        serializedName: "message",
        type: {
          name: "String"
        }
      },
      target: {
        serializedName: "target",
        type: {
          name: "String"
        }
      },
      details: {
        serializedName: "details",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "PersonalizerError"
            }
          }
        }
      },
      innerError: {
        serializedName: "innerError",
        type: {
          name: "Composite",
          className: "InternalError"
        }
      }
    }
  }
};

export const ErrorResponse: msRest.CompositeMapper = {
  serializedName: "ErrorResponse",
  type: {
    name: "Composite",
    className: "ErrorResponse",
    modelProperties: {
      error: {
        required: true,
        serializedName: "error",
        type: {
          name: "Composite",
          className: "PersonalizerError"
        }
      }
    }
  }
};

export const RewardRequest: msRest.CompositeMapper = {
  serializedName: "RewardRequest",
  type: {
    name: "Composite",
    className: "RewardRequest",
    modelProperties: {
      value: {
        required: true,
        serializedName: "value",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const RankableAction: msRest.CompositeMapper = {
  serializedName: "RankableAction",
  type: {
    name: "Composite",
    className: "RankableAction",
    modelProperties: {
      id: {
        required: true,
        serializedName: "id",
        constraints: {
          MaxLength: 256
        },
        type: {
          name: "String"
        }
      },
      features: {
        required: true,
        serializedName: "features",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Object"
            }
          }
        }
      }
    }
  }
};

export const RankRequest: msRest.CompositeMapper = {
  serializedName: "RankRequest",
  type: {
    name: "Composite",
    className: "RankRequest",
    modelProperties: {
      contextFeatures: {
        serializedName: "contextFeatures",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Object"
            }
          }
        }
      },
      actions: {
        required: true,
        serializedName: "actions",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "RankableAction"
            }
          }
        }
      },
      excludedActions: {
        serializedName: "excludedActions",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      },
      eventId: {
        serializedName: "eventId",
        constraints: {
          MaxLength: 256
        },
        type: {
          name: "String"
        }
      },
      deferActivation: {
        serializedName: "deferActivation",
        defaultValue: false,
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const RankedAction: msRest.CompositeMapper = {
  serializedName: "RankedAction",
  type: {
    name: "Composite",
    className: "RankedAction",
    modelProperties: {
      id: {
        readOnly: true,
        serializedName: "id",
        constraints: {
          MaxLength: 256
        },
        type: {
          name: "String"
        }
      },
      probability: {
        readOnly: true,
        serializedName: "probability",
        constraints: {
          InclusiveMaximum: 1,
          InclusiveMinimum: 0
        },
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const RankResponse: msRest.CompositeMapper = {
  serializedName: "RankResponse",
  type: {
    name: "Composite",
    className: "RankResponse",
    modelProperties: {
      ranking: {
        readOnly: true,
        serializedName: "ranking",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "RankedAction"
            }
          }
        }
      },
      eventId: {
        readOnly: true,
        serializedName: "eventId",
        constraints: {
          MaxLength: 256
        },
        type: {
          name: "String"
        }
      },
      rewardActionId: {
        readOnly: true,
        serializedName: "rewardActionId",
        constraints: {
          MaxLength: 256
        },
        type: {
          name: "String"
        }
      }
    }
  }
};
