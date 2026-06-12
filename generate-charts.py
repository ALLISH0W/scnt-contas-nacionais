import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.font_manager import FontProperties
import os

# Font setup
_FONT_PATHS = [
    "/System/Library/Fonts/Supplemental/SimHei.ttf",
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
    "/usr/share/fonts/truetype/chinese/SimHei.ttf",
    "./SimHei.ttf",
]
ZH_FONT = None
for _fp in _FONT_PATHS:
    try:
        ZH_FONT = FontProperties(fname=_fp)
        break
    except:
        continue

plt.rcParams["axes.unicode_minus"] = False
plt.rcParams["font.family"] = "sans-serif"
plt.rcParams["font.sans-serif"] = ["Arial", "DejaVu Sans", "Helvetica"]

# Palette
ACCENT = "#529286"
SERIES_COLORS = ["#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"]
GRID_COLOR = "#E0E0E0"
TEXT_COLOR = "#1C2A3D"

def save_chart(fig, path, dpi=200):
    w, h = fig.get_size_inches()
    if abs(w - h) < 0.1:
        fig.savefig(path, dpi=dpi, bbox_inches="tight", pad_inches=0.3,
                    facecolor="white", edgecolor="none")
    else:
        fig.savefig(path, dpi=dpi, bbox_inches="tight", pad_inches=0.1,
                    facecolor="white", edgecolor="none")
    plt.close(fig)
    print(f"Chart saved: {path}")

# ═══ CHART 1: GDP Trajectory ═══
def gdp_trajectory():
    quarters = ["Q1'20", "Q2'20", "Q3'20", "Q4'20", "Q1'21", "Q2'21", "Q3'21", "Q4'21",
                "Q1'22", "Q2'22", "Q3'22", "Q4'22", "Q1'23", "Q2'23", "Q3'23", "Q4'23",
                "Q1'24", "Q2'24", "Q3'24", "Q4'24"]
    values = [96.84, 85.23, 90.12, 93.45, 95.67, 99.34, 100.89, 103.21,
              102.56, 104.78, 105.34, 106.12, 105.89, 107.23, 108.45, 109.12,
              108.76, 110.34, 111.56, 112.23]
    
    fig, ax = plt.subplots(figsize=(12, 5.5))
    
    # COVID shock highlight
    ax.axvspan(0.5, 1.5, alpha=0.12, color="#ef4444", label="COVID-19 Impact")
    ax.axvspan(1.5, 2.5, alpha=0.12, color="#10b981", label="Recovery Period")
    
    ax.plot(range(len(values)), values, marker="o", markersize=4, linewidth=2.5,
            color=ACCENT, label="GDP Index", zorder=5)
    
    # Annotate COVID dip
    ax.annotate("COVID-19\n-9.6%", xy=(1, 85.23), xytext=(2.5, 82),
                fontsize=9, color="#ef4444", fontweight="bold",
                arrowprops=dict(arrowstyle="->", color="#ef4444", lw=1.5),
                ha="center")
    
    # Annotate recovery
    ax.annotate("+17.4%", xy=(2, 90.12), xytext=(3.5, 88),
                fontsize=9, color="#10b981", fontweight="bold",
                arrowprops=dict(arrowstyle="->", color="#10b981", lw=1.5),
                ha="center")
    
    # Annotate latest
    ax.annotate(f"112.23", xy=(19, 112.23), xytext=(17.5, 114),
                fontsize=9, color=ACCENT, fontweight="bold",
                arrowprops=dict(arrowstyle="->", color=ACCENT, lw=1.2),
                ha="center")
    
    # Pre-pandemic line
    ax.axhline(y=96.84, color="#808080", linestyle="--", linewidth=0.8, alpha=0.5)
    ax.text(15, 97.2, "Pre-pandemic level", fontsize=8, color="#808080")
    
    ax.set_xticks(range(len(quarters)))
    ax.set_xticklabels(quarters, fontsize=8, rotation=45, ha="right")
    ax.set_ylabel("Index (Base: 1995 = 100)", fontsize=10, color=TEXT_COLOR)
    ax.set_title("GDP Quarterly Index with Seasonal Adjustment", fontsize=13, pad=15, color=TEXT_COLOR, fontweight="bold")
    ax.legend(loc="lower right", frameon=True, fontsize=8, framealpha=0.9)
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="y", alpha=0.3, color=GRID_COLOR)
    ax.set_ylim(78, 116)
    
    save_chart(fig, "/home/z/my-project/report-charts/gdp_trajectory.png")

# ═══ CHART 2: Sector Performance ═══
def sectors_performance():
    quarters = ["Q1'21", "Q2'21", "Q3'21", "Q4'21", "Q1'22", "Q2'22", "Q3'22", "Q4'22",
                "Q1'23", "Q2'23", "Q3'23", "Q4'23", "Q1'24", "Q2'24", "Q3'24", "Q4'24"]
    
    agri = [102.34, 103.45, 104.12, 104.89, 105.23, 105.89, 106.12, 106.34,
            106.56, 107.12, 107.34, 107.23, 106.89, 107.45, 107.56, 107.34]
    ind = [91.56, 95.67, 97.89, 99.78, 99.34, 101.23, 101.89, 102.45,
           102.67, 103.89, 104.56, 105.12, 105.34, 106.78, 107.23, 107.89]
    serv = [96.78, 99.45, 101.56, 103.67, 103.12, 105.34, 106.12, 107.23,
            107.45, 108.56, 109.67, 110.23, 110.56, 112.12, 113.45, 114.12]
    pib = [95.67, 99.34, 100.89, 103.21, 102.56, 104.78, 105.34, 106.12,
           105.89, 107.23, 108.45, 109.12, 108.76, 110.34, 111.56, 112.23]
    
    fig, ax = plt.subplots(figsize=(12, 5.5))
    
    x = range(len(quarters))
    ax.plot(x, agri, marker="s", markersize=3, linewidth=2, color=SERIES_COLORS[0], label="Agriculture")
    ax.plot(x, ind, marker="^", markersize=3, linewidth=2, color=SERIES_COLORS[1], label="Industry")
    ax.plot(x, serv, marker="D", markersize=3, linewidth=2, color=SERIES_COLORS[2], label="Services")
    ax.plot(x, pib, marker="o", markersize=3, linewidth=2.5, color=SERIES_COLORS[3], label="GDP", linestyle="--")
    
    ax.set_xticks(range(len(quarters)))
    ax.set_xticklabels(quarters, fontsize=8, rotation=45, ha="right")
    ax.set_ylabel("Index (Base: 1995 = 100)", fontsize=10, color=TEXT_COLOR)
    ax.set_title("GDP by Sector - Seasonally Adjusted Index", fontsize=13, pad=15, color=TEXT_COLOR, fontweight="bold")
    ax.legend(loc="upper left", frameon=True, fontsize=8, framealpha=0.9, ncol=2)
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(True, alpha=0.3, color=GRID_COLOR)
    
    save_chart(fig, "/home/z/my-project/report-charts/sectors_performance.png")

# ═══ CHART 3: Expenditure Components ═══
def expenditure_components():
    quarters = ["Q1'23", "Q2'23", "Q3'23", "Q4'23", "Q1'24", "Q2'24", "Q3'24", "Q4'24"]
    
    agri = [106.56, 107.12, 107.34, 107.23, 106.89, 107.45, 107.56, 107.34]
    ind = [102.67, 103.89, 104.56, 105.12, 105.34, 106.78, 107.23, 107.89]
    cons = [107.23, 108.45, 109.12, 109.89, 110.23, 111.56, 112.34, 113.12]
    serv = [107.45, 108.56, 109.67, 110.23, 110.56, 112.12, 113.45, 114.12]
    pib = [105.89, 107.23, 108.45, 109.12, 108.76, 110.34, 111.56, 112.23]
    
    fig, ax = plt.subplots(figsize=(12, 5.5))
    
    x = np.arange(len(quarters))
    width = 0.15
    
    bars1 = ax.bar(x - 2*width, agri, width, label="Agriculture", color=SERIES_COLORS[0], edgecolor="white")
    bars2 = ax.bar(x - width, ind, width, label="Industry", color=SERIES_COLORS[1], edgecolor="white")
    bars3 = ax.bar(x, cons, width, label="Household Consumption", color=SERIES_COLORS[4], edgecolor="white")
    bars4 = ax.bar(x + width, serv, width, label="Services", color=SERIES_COLORS[2], edgecolor="white")
    bars5 = ax.bar(x + 2*width, pib, width, label="GDP", color=SERIES_COLORS[3], edgecolor="white")
    
    ax.set_xticks(x)
    ax.set_xticklabels(quarters, fontsize=9)
    ax.set_ylabel("Index (Base: 1995 = 100)", fontsize=10, color=TEXT_COLOR)
    ax.set_title("Expenditure Components - Last 8 Quarters", fontsize=13, pad=15, color=TEXT_COLOR, fontweight="bold")
    ax.legend(loc="upper left", frameon=True, fontsize=8, framealpha=0.9, ncol=3)
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="y", alpha=0.3, color=GRID_COLOR)
    ax.set_ylim(100, 117)
    
    save_chart(fig, "/home/z/my-project/report-charts/expenditure_components.png")

# ═══ CHART 4: Growth Rates ═══
def growth_rates():
    quarters = ["Q1'20", "Q2'20", "Q3'20", "Q4'20", "Q1'21", "Q2'21", "Q3'21", "Q4'21",
                "Q1'22", "Q2'22", "Q3'22", "Q4'22", "Q1'23", "Q2'23", "Q3'23", "Q4'23",
                "Q1'24", "Q2'24", "Q3'24", "Q4'24"]
    values = [96.84, 85.23, 90.12, 93.45, 95.67, 99.34, 100.89, 103.21,
              102.56, 104.78, 105.34, 106.12, 105.89, 107.23, 108.45, 109.12,
              108.76, 110.34, 111.56, 112.23]
    
    growth = []
    for i in range(1, len(values)):
        g = ((values[i] - values[i-1]) / values[i-1]) * 100
        growth.append(g)
    
    q_labels = quarters[1:]
    
    fig, ax = plt.subplots(figsize=(12, 5.5))
    x = np.arange(len(growth))
    
    colors = ["#10b981" if g >= 0 else "#ef4444" for g in growth]
    bars = ax.bar(x, growth, color=colors, width=0.7, edgecolor="white")
    
    # Annotate extremes
    min_idx = growth.index(min(growth))
    max_idx = growth.index(max(growth))
    ax.annotate(f"{growth[min_idx]:.1f}%", xy=(min_idx, growth[min_idx]),
                xytext=(min_idx + 1, growth[min_idx] - 3),
                fontsize=9, color="#ef4444", fontweight="bold",
                arrowprops=dict(arrowstyle="->", color="#ef4444", lw=1.5),
                ha="center")
    ax.annotate(f"+{growth[max_idx]:.1f}%", xy=(max_idx, growth[max_idx]),
                xytext=(max_idx + 1.5, growth[max_idx] + 1),
                fontsize=9, color="#10b981", fontweight="bold",
                arrowprops=dict(arrowstyle="->", color="#10b981", lw=1.5),
                ha="center")
    
    ax.axhline(y=0, color="#333333", linewidth=0.8)
    ax.set_xticks(range(len(q_labels)))
    ax.set_xticklabels(q_labels, fontsize=8, rotation=45, ha="right")
    ax.set_ylabel("Quarterly Variation (%)", fontsize=10, color=TEXT_COLOR)
    ax.set_title("GDP Quarterly Growth Rate (%)", fontsize=13, pad=15, color=TEXT_COLOR, fontweight="bold")
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="y", alpha=0.3, color=GRID_COLOR)
    
    save_chart(fig, "/home/z/my-project/report-charts/growth_rates.png")

# Generate all charts
print("Generating charts...")
gdp_trajectory()
sectors_performance()
expenditure_components()
growth_rates()
print("All charts generated successfully!")
