from torchvision import transforms

MEAN = [0.21568823, 0.21569253, 0.21573254]
STD  = [0.19483397, 0.19483515, 0.19485890]

val_transform = transforms.Compose([
    transforms.Resize((512, 512), antialias=True),
    transforms.ToTensor(),
    transforms.Normalize(mean=MEAN, std=STD),
])

def preprocess(image):
    return val_transform(image).unsqueeze(0)
