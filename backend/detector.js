import fs from "fs";
import path from "path";

const modelPath = path.join(
  process.cwd(),
  "models",
  "model.onnx"
);

export async function detect(frameBuffer) {

  /*
    Real ONNX detection will go here when
    model.onnx is provided.
  */

  if (!fs.existsSync(modelPath)) {

    console.log("No model.onnx found - using demo detector");

    return [
      {
        class: "road_defect",
        confidence: 0.92,
        box: {
          x: 25,
          y: 20,
          width: 180,
          height: 120
        }
      }
    ];
  }

  /*
    TODO:
    Load ONNX model and perform inference.
  */

  return [];
}