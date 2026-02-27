import type ButtonControllerInterface from "../models/ButtonController";

export default function ButtonContoller(title: string, func: VoidFunction): ButtonControllerInterface{
  return {
    function: func,
    title
  }
}