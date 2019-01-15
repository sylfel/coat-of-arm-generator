let colorNames = require("./data/colorNames.json");
let patterns = require("./data/patterns.json");
let charges = require("./data/charges.json");
let semes = require("./data/semes.json");
let partitions = require("./data/partitions.json");

export default function generateBlazon(model) {
  let label = _getPartitionning(model);

  // Capitalize first letter
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function _getPartitionning(model) {
  if (!model) {
    return "[empty]";
  }

  let partitionDef = partitions[model.type];
  if (!partitionDef) {
    return "unsupported partitionning '" + model.type + "'";
  }

  let count = partitionDef.match(/\{\}/g).length;
  for (let i = 0; i < count; i++) {
    partitionDef = partitionDef.replace("{}", _getPartition(model.partitions[i].model));
  }
  return partitionDef;
}

function _getPartition(model) {
  if (!model || model == "none") {
    return "[of-empty]";
  }
  let fillerLabel = _getFiller(model.filler);
  if (charges.length > 0) {
    let charges = _getCharges(model.charges);
    return fillerLabel + " " + charges;
  } else {
    return fillerLabel;
  }
}

function _getCharges(charges) {
  return "charges:" + charges.length;
}

function _getFiller(model) {
  switch (model.type) {
    case "plein": return _plein(model);
    case "pattern": return _pattern(model);
    case "seme": return _seme(model);
    default: return "unsupported-type:" + model.type;
  }
}

function _getColor(key) {
  return colorNames[key];
}

function _plein(model) {
  return _getColor(model.color);
}

function _pattern(model) {
  let pattern = patterns[model.patternName];
  if (typeof pattern === 'string' || pattern instanceof String) {
    return _simplePattern(model, pattern);
  } else {
    for (let aCase of pattern.cases) {
      if (aCase.colors[0] == model.color1 && aCase.colors[1] == model.color2) {
        return aCase.label;
      }
    }
    // else (if colors match no case)
    return _simplePattern(model, pattern.else);
  }
}

function _seme(model) {

  let semeDef = semes[model.chargeId];
  if (semeDef) {
    for (let aCase of semeDef.cases) {
      if (aCase.colors[0] == model.fieldColor && aCase.colors[1] == model.chargeColor) {
        return aCase.label;
      }
    }
    // else case
    return _simpleSeme(model.fieldColor, semeDef.else, model.chargeColor);
  } else {
    let semeLabel = _getSeme(model.chargeId);
    return _simpleSeme(model.fieldColor, semeLabel, model.chargeColor);
  }
}

function _simpleSeme(fieldColor, semeLabel, chargeColor) {
  return _getColor(fieldColor) + " " + semeLabel + " " + _getColor(chargeColor);
}

function _getSeme(chargeId) {
  let chargeDef = charges[chargeId]
  if (!chargeDef) {
    return "semé de [?]";
  }

  if (chargeDef.label.elision) {
    return "semé d'" + chargeDef.label.plural;
  } else {
    return "semé de " + chargeDef.label.plural;
  }
}

function _simplePattern(model, label) {
  let string = label;
  if (model.angle) {
    switch (model.angle) {
      case "bande": string += " en bande"; break;
      case "barre": string += " en barre"; break;
      case "defaut": break;
      default: return "invalid-angle:" + model.angle;
    }
  }
  string += " " + _getColor(model.color1) + " et " + _getColor(model.color2);
  return string;

}