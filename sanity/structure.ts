import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Interio Admin")
    .items([
      S.documentTypeListItem("product").title("Products"),
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("size").title("Sizes"),
      S.documentTypeListItem("height").title("Heights"),

      S.divider(),
      S.documentTypeListItem("userProfile").title("Users"),

      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !["product", "category", "size", "height", "userProfile"].includes(item.getId()!)
      ),
    ]);
