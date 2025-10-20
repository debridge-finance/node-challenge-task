import { DeBridgeTokenMetaValidated } from "../types/debridge-processing-tokens.types";
import { UniversalInvalidatingTokenMetadata } from "../../../../common/libs/types/universal-token.types";
import { UNKNOWN_TOKEN_METADATA } from "../../../../common/libs/constants/unknown-items.const";

export const validateDeBridgeTokenMeta = (
  deBridgeToken: UniversalInvalidatingTokenMetadata
): DeBridgeTokenMetaValidated => {
  const hasValidMetadata =
    deBridgeToken.name &&
    deBridgeToken.symbol &&
    deBridgeToken.name.trim() &&
    deBridgeToken.symbol.trim();

  const name = deBridgeToken.name?.trim() || UNKNOWN_TOKEN_METADATA.name;
  const symbol = deBridgeToken.symbol?.trim() || UNKNOWN_TOKEN_METADATA.symbol;

  return {
    name,
    symbol,
    isValid: !!hasValidMetadata,
  };
};
