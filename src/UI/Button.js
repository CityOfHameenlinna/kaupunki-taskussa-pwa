import React from 'react'
import classes from './SCSS/Button.module.scss'

const button = (props) => (
    <button className={classes.Button}
    onClick={props.clickHandler}
    >{props.children}</button>
)

export default button;
