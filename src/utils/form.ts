export const filterEmptyFields = (values: any) => {
  return Object.fromEntries(Object.entries(values).filter(([_, value]) => value !== '' && value !== null && value !== undefined))
}