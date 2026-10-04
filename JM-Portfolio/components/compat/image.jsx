import * as React from "react";
export default function Image({ fill, priority, quality, style, ...props }) {
    return (<img {...props} loading={priority ? "eager" : props.loading ?? "lazy"} style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style}/>);
}
