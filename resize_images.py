import os
from PIL import Image

def resize_images(directory, max_width=600):
    """
    Resizes all non-circuit images in a directory to a maximum width
    while maintaining aspect ratio.

    Args:
        directory (str): The path to the directory containing images.
        max_width (int): The maximum width for the resized images.
    """
    if not os.path.isdir(directory):
        print(f"Error: Directory not found at '{directory}'")
        return

    # List of filenames to exclude (circuit diagrams)
    exclude_files = {
        'locomotion_circuit.png',
        'locomotion_circuit2.png',
        'locomotion_circuit3.png',
        'ball_sensor_circuit.png',
        'reward_diagram.png',
        'reward_water_pump_circuit.png',
        'reward_water_valve_circuit.png',
        'reward_water_pressure_circuit.png',
        'reward_face_puff_circuit.png',
        'trigger_circuit.png'
    }

    for filename in os.listdir(directory):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')) and filename not in exclude_files:
            filepath = os.path.join(directory, filename)
            try:
                with Image.open(filepath) as img:
                    if img.width > max_width:
                        aspect_ratio = img.height / img.width
                        new_height = int(max_width * aspect_ratio)
                        resized_img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                        
                        # Create the new filename with _600px suffix
                        name, ext = os.path.splitext(filename)
                        new_filename = f"{name}_600px{ext}"
                        new_filepath = os.path.join(directory, new_filename)
                        
                        # Save the resized image
                        resized_img.save(new_filepath)
                        print(f"Resized and saved '{new_filename}'")
                    else:
                        print(f"Skipped '{filename}' (width is not greater than {max_width}px)." )
            except Exception as e:
                print(f"Error processing '{filename}': {e}")

if __name__ == "__main__":
    # The script is expected to be in the root directory of the project
    image_dir = os.path.join(os.path.dirname(__file__), 'images/guide')
    resize_images(image_dir)
