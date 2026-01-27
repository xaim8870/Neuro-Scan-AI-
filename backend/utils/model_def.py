import torch
import torch.nn as nn
import torch.nn.functional as F
import timm

class SwinBackbone(nn.Module):
    def __init__(self, variant="swin_tiny_patch4_window7_224", in_chans=3, pretrained=False):
        super().__init__()
        self.model = timm.create_model(
            variant,
            pretrained=pretrained,
            features_only=True,
            in_chans=in_chans,
            out_indices=(1, 2, 3),
            img_size=512,
            window_size=8,
        )
        self.channels = self.model.feature_info.channels()

    def forward(self, x):
        feats = self.model(x)
        return [f.permute(0, 3, 1, 2).contiguous() for f in feats]

class FPNNeck(nn.Module):
    def __init__(self, in_channels, out_c=128):
        super().__init__()
        c3, c4, c5 = in_channels
        self.reduce3 = nn.Conv2d(c3, out_c, 1)
        self.reduce4 = nn.Conv2d(c4, out_c, 1)
        self.reduce5 = nn.Conv2d(c5, out_c, 1)

    def forward(self, c3, c4, c5):
        p3 = self.reduce3(c3)
        p4 = self.reduce4(c4)
        p5 = self.reduce5(c5)
        p3_up = F.interpolate(p3, size=p5.shape[-2:], mode="nearest")
        p4_up = F.interpolate(p4, size=p5.shape[-2:], mode="nearest")
        return torch.cat([p3_up, p4_up, p5], dim=1)

class YOLOv12SwinClassifier(nn.Module):
    def __init__(self, num_classes=4, backbone_variant="swin_tiny_patch4_window7_224"):
        super().__init__()
        self.backbone = SwinBackbone(
            variant=backbone_variant,
            in_chans=3,
            pretrained=False,  # important for ckpt load
        )
        self.neck = FPNNeck(self.backbone.channels, out_c=128)
        self.merge_conv = nn.Conv2d(128 * 3, 256, kernel_size=3, padding=1)
        self.avgpool = nn.AdaptiveAvgPool2d(1)
        self.dropout = nn.Dropout(p=0.4)
        self.fc = nn.Linear(256, num_classes)

    def forward(self, x):
        c3, c4, c5 = self.backbone(x)
        fused = self.neck(c3, c4, c5)
        merged = F.relu(self.merge_conv(fused))
        pooled = self.avgpool(merged).view(x.size(0), -1)
        pooled = self.dropout(pooled)
        return self.fc(pooled)
