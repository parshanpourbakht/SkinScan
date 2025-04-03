from flask import Flask, request, jsonify
import tensorflow as tf
from flask_cors import CORS
import numpy as np
from PIL import Image
import io

DATA_MEAN = 159.7910267265768
DATA_STD = 46.388174504200656

app = Flask(__name__)
CORS(app)

# Load the model
model = tf.keras.models.load_model("models/skin_scan_model.keras")

# Define lesion dictionary and class order for human-readable labels
lesion_dict = {
    'nv': 'Melanocytic nevi',
    'mel': 'Melanoma',
    'bkl': 'Benign keratosis-like lesions',
    'bcc': 'Basal cell carcinoma',
    'akiec': 'Actinic keratoses',
    'vasc': 'Vascular lesions',
    'df': 'Dermatofibroma'
}

# Define the class order used in training
class_order = ['nv', 'mel', 'bkl', 'bcc', 'akiec', 'vasc', 'df']

# Preprocessing function
def preprocess_image(image):
    image = image.resize((100, 75))         # Resize to match your dataset
    image = (np.array(image) - DATA_MEAN) / DATA_STD        # Normalize
    image = np.expand_dims(image, axis=0)   # Add batch dimension
    return image

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    image = Image.open(io.BytesIO(file.read()))

    processed_image = preprocess_image(image)
    prediction = model.predict(processed_image)

    # Get the index of the maximum probability
    predicted_index = np.argmax(prediction)

    predicted_label = class_order[predicted_index]

    human_readable_label = lesion_dict[predicted_label]

    # Convert the confidence score to a native Python float 
    confidence_score = float(prediction[0][predicted_index])

    return jsonify({
        "prediction": human_readable_label,
        "confidence": confidence_score 
    })

if __name__ == "__main__":
    # app.run(debug=True)
    app.run(host="0.0.0.0", port=5000, debug=False)