import anyRateOracle from "./abis/anyRateOracle.json";
import billingFactory from "./abis/billingFactory.json";
import ownableAbi from "./abis/ownable.json";
import treasuryFactory from "./abis/treasuryFactory.json";
import billing from "./abis/billing.json";

const abis = {
  ownable: ownableAbi,
  anyRateOracle: anyRateOracle,
  billingFactory: billingFactory,
  treasuryFactory: treasuryFactory,
  billing: billing,
};

export default abis;
