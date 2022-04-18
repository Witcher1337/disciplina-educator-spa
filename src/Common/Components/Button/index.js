// @flow
import React, { memo } from "react";
import { Spinner } from "../Spinner";
import "./styles.scss";

type ButtonProps = {
  text: string,
  modWidth?: "width-auto" | "width-full",
  modHeight?: "height-small" | "height-big",
  modStyle: "filled" | "empty" | "simple" | "arrow-forward" | "arrow-back",
  modColor: "color-main" | "color-red",
  loading?: boolean,
  type?: "button" | "submit",
  callback?: (e: any) => Promise<any> | void
};

const Button = (props: ButtonProps) => {
  const {
    text,
    modStyle,
    modHeight = "height-big",
    modWidth = "width-auto",
    modColor,
    callback,
    type = "button",
    loading = false
  } = props;
  return (
    /*eslint react/button-has-type: off */
    <button
      className={`btn btn--${modWidth} btn--${modHeight} btn--${modStyle} btn--${modColor}`}
      disabled={loading}
      data-loading={loading}
      type={type}
      onClick={callback}
    >
      <div className="spinner-box">{<Spinner strokeWidth="1" />}</div>
      {text}
    </button>
  );
};

Button.defaultProps = {
  modWidth: "width-auto",
  modHeight: "height-big",
  type: "button"
};

export default memo<ButtonProps>(Button);
