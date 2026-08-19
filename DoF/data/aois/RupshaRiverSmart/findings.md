# Rupsha River Smart Fish Intelligence Multi-Species

_Generated: 2026-08-19T05:10:33.823437Z_

## Species

- **Common name:** Rohu
- **Scientific:** _Labeo rohita_
- **Family:** Cyprinidae
- **Habitat:** freshwater
- **Temperature tolerance:** 14.0–38.0°C (opt 28.0°C)
- **DO minimum:** 5.0 mg/L
- **Salinity max:** 3.0 ppt
- **Data source:** FAO_generic_v2024

## Water Quality

**Overall risk: `CRITICAL`**

⚠ 7/7 parameters used synthetic defaults (no field observations).

| Parameter | Observed | Risk | Note |
|---|---|---|---|
| temperature | 27.00 *(synthetic)* | `optimal` | 27.0°C is near optimum (28.0°C) |
| dissolved_oxygen | 6.38 *(synthetic)* | `acceptable` | DO 6.38 mg/L is adequate |
| salinity | 5.88 *(synthetic)* | `critical` | Salinity 5.88 ppt severely exceeds tolerance (3.0) |
| ph | 7.57 *(synthetic)* | `optimal` | pH 7.57 is near optimum (7.5) |
| turbidity | 92.50 *(synthetic)* | `marginal` | Turbidity 92.5 NTU is elevated |
| conductivity | 3075.00 *(synthetic)* | `acceptable` | Conductivity 3075.0 µS/cm indicates brackish water |
| ammonia | 0.04 *(synthetic)* | `acceptable` | Ammonia 0.04 mg/L is safe |

### Critical Flags
- 🚨 Salinity 5.88 ppt severely exceeds tolerance (3.0)

## Growth Forecast

- **Model:** VBGF_daily_scaled (screening_estimate)
- **Forecast period:** 90 days
- **Initial weight:** 250.00 g
- **Final weight:** 278.89 g
- **Total gain:** 28.89 g (11.6%)
- **Mean daily gain:** 0.321 g/day
- **Environmental factor:** 0.192 (1.0 = optimal)

| Factor | Value |
|---|---|
| temperature | 0.932 |
| dissolved_oxygen | 0.888 |
| salinity | 0.232 |
| combined | 0.192 |

## Biomass Projection

_No population supplied — per-fish trajectory only._

---

### Provenance & Limitations

- Species parameters: FAO/FishBase generic screening estimates
- Growth model: Von Bertalanffy with environmental scaling
- Water quality: species-specific tolerance thresholds
- **Not calibrated for Rupsha River** — screening estimates only
- For BFRI/regulatory use, replace with site-calibrated parameters