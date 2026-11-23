/**
 * The value impact the API works out and keeps (ValueImpact.Of, BR-MPPL-05): the new value less the PO's value,
 * (new price or system price) × (new quantity or PO quantity) − system price × PO quantity, to 4 decimals. Null
 * when neither a new price nor a new quantity is given, or the PO data has no price or quantity. Shown as a preview
 * only; the API's value is the one stored.
 */
export function valueImpactOf(systemPrice: number | null, quantity: number | null, newPrice: number | null, newQuantity: number | null): number | null {
  if ((newPrice === null && newQuantity === null) || systemPrice === null || quantity === null) return null;
  const impact = (newPrice ?? systemPrice) * (newQuantity ?? quantity) - systemPrice * quantity;
  // Rounded half away from zero, as decimal.Round(..., MidpointRounding.AwayFromZero)
  return (Math.sign(impact) * Math.round(Math.abs(impact) * 10_000)) / 10_000;
}
