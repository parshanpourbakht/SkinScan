from flask import Flask, request, jsonify 

@app.route('/predict', method=['POST'])
def predict():
    