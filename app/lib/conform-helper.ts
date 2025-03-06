import type { FieldMetadata } from "@conform-to/react"

/**
 * Cleanup `undefined` from the result.
 * To minimize conflicts when merging with user defined props
 */
function simplify<Props>(props: Props): Props {
  for (const key in props) {
    if (props[key] === undefined) {
      delete props[key]
    }
  }
  return props
}

export const getSwitchProps = <Schema>(
  metadata: FieldMetadata<Schema>,
  options:
    | {
        ariaAttributes?: true
        ariaInvalid?: "errors" | "allErrors"
        ariaDescribedBy?: string
        value?: boolean
      }
    | {
        ariaAttributes: false
        value?: boolean
      } = {
    ariaAttributes: true,
  },
) => {
  const props: {
    id: string
    key?: string
    required?: boolean
    name: string
    defaultChecked?: boolean
    "aria-invalid"?: boolean
    "aria-describedby"?: string
  } = {
    id: metadata.id,
    key: metadata.key,
    required: metadata.required,
    name: metadata.name,
  }

  if (typeof options.value === "undefined" || options.value) {
    props.defaultChecked = metadata.initialValue === "on"
  }

  if (options.ariaAttributes) {
    const invalid = options.ariaInvalid === "allErrors" ? !metadata.valid : typeof metadata.errors !== "undefined"
    const ariaDescribedBy = options.ariaDescribedBy
    props["aria-invalid"] = invalid || undefined
    props["aria-describedby"] = invalid ? `${metadata.errorId} ${ariaDescribedBy ?? ""}`.trim() : ariaDescribedBy
  }

  return simplify(props)
}
