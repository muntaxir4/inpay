import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function App() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
  return <SwaggerUI url={API_URL + "/user/doc"} />;
}
