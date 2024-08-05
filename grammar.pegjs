{
  // Include any necessary JavaScript code here
}

Start
  = configuration

configuration
  = categories:(category _)* {
      return { categories };
    }

category
  = "category" _ type:[a-zA-Z]+ _ categoryBody:categoryBody _ "endcategory" {
      return {
        type: type.join(""),
        ...categoryBody
      };
    }

categoryBody
  = fields:fieldList? _ calculations:calculationList? {
      return {
        fields: fields || [],
        calculations: calculations || []
      };
    }

fieldList
  = fields:(field _)* {
      return fields;
    }

field
  = "Field" _ "\"" name:fieldName "\"" _ "DataType" _ dataType:dataType _ "Mandatory" _ mandatory:boolean _ "Hidden" _ hidden:boolean _ "Value" _ "\"" value:fieldValue? "\""_ list:list? {
      return {
        name: name,
        dataType: dataType,
        mandatory: mandatory,
        hidden: hidden,
        value: value || null,
        list: list || []
      };
    }

fieldName
  = [a-zA-Z0-9_]+ {
      return text();
    }

fieldValue
  = [a-zA-Z0-9_]+ {
      return text();
    }

dataType
  = "text" {
      return "text";
    }
  / "list" {
      return "list";
    }
  / "number" {
      return "number";
    }

boolean
  = "true" {
      return true;
    }
  / "false" {
      return false;
    }

list
  = "List" _ "{" _ items:listItemList _ "}" {
      return items || [];
    }

listItemList
  = items:(listItem (_ "," _ listItem)*)? _ {
      return items || [];
    }

listItem
  = name:[a-zA-Z0-9_]+ _ ":" _ value:quotedString {
      return {
        name: name.join(""),
        value: value
      };
    }

quotedString
  = "\"" chars:[^\"]* "\"" {
      return chars.join("");
    }

calculationList
  = calculations:(calculation _)* {
      return calculations;
    }

calculation
  = "Calculation" _ "\"" name:fieldName "\"" _ "Value" _ value:quotedString {
      return {
        name: name,
        value: value
      };
    }

_ "whitespace"
  = [ \t\n\r]*  // Handles optional whitespace and newline characters
