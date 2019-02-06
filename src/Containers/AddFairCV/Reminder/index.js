// @flow
import React from "react";
import Button from "../../../Common/Components/Button";
import "./styles.scss";

type ReminderProps = {
  className: string
}

export const Reminder = (props: ReminderProps) => {
  const {className} = props;
  return (
    <div className={`reminder ${className}`}>
      <div className="reminder__text">
        <span />
        <p>
          Внимательно проверьте все данные перед сохранением. Изменить
          сохраненные записи будет невозможно!
        </p>
      </div>
      <Button
        text="Сохранить FairCV"
        modWidth="width-auto"
        modHeight="height-big"
        modStyle="filled"
        modColor="color-main"
        callback={() => {}}
      />
    </div>
  );
}
export default Reminder
