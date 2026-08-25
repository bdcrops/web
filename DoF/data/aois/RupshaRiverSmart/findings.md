# Rupsha River Smart Fish Intelligence Multi-Species

_Generated: 2026-08-25T01:07:04.667385Z_

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

**Overall risk: `FATAL`**

| Parameter | Observed | Risk | Note |
|---|---|---|---|
| temperature | 28.20 | `optimal` | 28.2°C is near optimum (28.0°C) |
| dissolved_oxygen | 5.20 | `acceptable` | DO 5.2 mg/L is adequate |
| salinity | 8.20 | `fatal` | Salinity 8.2 ppt is fatal for Rohu (max: 3.0) |
| ph | 7.60 | `optimal` | pH 7.6 is near optimum (7.5) |
| turbidity | 45.00 | `acceptable` | Turbidity 45.0 NTU is acceptable |
| conductivity | 2800.00 | `acceptable` | Conductivity 2800.0 µS/cm indicates brackish water |
| ammonia | 0.04 | `acceptable` | Ammonia 0.04 mg/L is safe |

### Critical Flags
- 🚨 Salinity 8.2 ppt is fatal for Rohu (max: 3.0)

## Growth Forecast

- **Model:** VBGF_daily_scaled (screening_estimate)
- **Forecast period:** 90 days
- **Initial weight:** 250.00 g
- **Final weight:** 418.57 g
- **Total gain:** 168.57 g (67.4%)
- **Mean daily gain:** 1.873 g/day
- **Environmental factor:** 1.000 (1.0 = optimal)

| Factor | Value |
|---|---|
| temperature | 1.0 |
| dissolved_oxygen | 1.0 |
| salinity | 1.0 |
| combined | 1.0 |

## Biomass Projection

_No population supplied — per-fish trajectory only._

---

### Provenance & Limitations

- Species parameters: FAO/FishBase generic screening estimates
- Growth model: Von Bertalanffy with environmental scaling
- Water quality: species-specific tolerance thresholds
- **Not calibrated for Rupsha River** — screening estimates only
- For BFRI/regulatory use, replace with site-calibrated parameters