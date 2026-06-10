# Task 7 - Rebuild API Routes for SCNT

## Summary
Rebuilt the API layer from generic IBGE data routes to SCNT (Sistema de Contas Nacionais Trimestrais) focused routes using the SIDRA API.

## What was done
1. **Deleted old IBGE routes**: Removed `/api/ibge/states`, `/api/ibge/population`, `/api/ibge/pib`, `/api/ibge/summary`
2. **Created `/api/scnt/gdp/route.ts`**: Quarterly GDP index (PIB) with seasonal adjustment from SIDRA Table 1621
3. **Created `/api/scnt/sectors/route.ts`**: GDP by sector (Agropecuária, Indústria, PIB, Serviços) from SIDRA
4. **Created `/api/scnt/components/route.ts`**: GDP expenditure components including Consumo das famílias from SIDRA
5. **Preserved auth routes**: `/api/auth/register` and `/api/auth/login` remain untouched

## Key Technical Details
- All routes use `NextResponse` from `next/server`
- SIDRA API calls wrapped in try/catch with comprehensive fallback data
- Cache headers: `s-maxage=3600, stale-while-revalidate=1800`
- Data format optimized for Recharts consumption (flat arrays with typed objects)
- SIDRA API verified working from this environment

## API Endpoints
| Endpoint | SIDRA URL | Returns |
|----------|-----------|---------|
| `/api/scnt/gdp` | t/1621/n1/all/v/584/p/last%2020/c11255/93407 | `{ quarter, quarterCode, value }[]` |
| `/api/scnt/sectors` | t/1621/n1/all/v/584/p/last%2016/c11255/93404,93405,93407,93408 | `{ quarter, quarterCode, sectorCode, sectorName, value }[]` |
| `/api/scnt/components` | t/1621/n1/all/v/584/p/last%2012/c11255/93404,93405,93406,93407,93408 | `{ quarter, quarterCode, componentCode, componentName, value }[]` |
