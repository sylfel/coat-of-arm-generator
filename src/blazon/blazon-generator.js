import { countableCharge } from './charge-labeller';
import getFiller from './filler-labeller';

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
  let fillerLabel = getFiller(model.filler);

  if (model.charges.length > 0) {
    let chargesLabel = _chargeList(model.charges);
    return fillerLabel + " " + chargesLabel;
  } else {
    return fillerLabel;
  }
}

function _chargeList(charges) {
  return charges.map(item => _singleCharge(item.model)).join(", ");
}

function _singleCharge(charge) {
  let chargeId = _getChargeId(charge);
  let chargeLabel = countableCharge(chargeId, charge.count);
  return chargeLabel + " " + getFiller(charge.filler);
}

function _getChargeId(charge) {
  if (charge.type == "strip") {
    switch (charge.angle) {
      case "0": return 'fasce';
      case "45": return 'barre';
      case "90": return 'pal';
      case "135": return 'bande';
      default: return 'strip:' + charge.angle;
    }
  }
  return "[invalid-type:" + charge.type + "]";
}