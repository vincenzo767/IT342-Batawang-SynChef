package edu.cit.batawang.synchef.features.flavorMap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import edu.cit.batawang.synchef.features.flavorMap.service.FlavorMapService;

/**
 * FlavorMapController - Vertical Slice: Flavor Map Feature
 * 
 * REST endpoints for flavor map operations
 * Endpoints:
 * - GET /api/continents - Get all continents
 * - GET /api/continents/{name}/countries - Get countries by continent
 * - GET /api/countries/{id} - Get country details
 * - GET /api/countries/{id}/recipes - Get recipes by country
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class FlavorMapController {

    private final FlavorMapService flavorMapService;

    public FlavorMapController(FlavorMapService flavorMapService) {
        this.flavorMapService = flavorMapService;
    }

    @GetMapping("/continents")
    public ResponseEntity<?> getContinents() {
        return ResponseEntity.ok(flavorMapService.getContinents());
    }

    @GetMapping("/continents/{name}/countries")
    public ResponseEntity<?> getCountriesByContinent(@PathVariable String name) {
        return ResponseEntity.ok(flavorMapService.getCountriesByContinent(name));
    }

    @GetMapping("/countries/{id}")
    public ResponseEntity<?> getCountryDetails(@PathVariable Long id) {
        return ResponseEntity.ok(flavorMapService.getCountryDetails(id));
    }

    @GetMapping("/countries/{id}/recipes")
    public ResponseEntity<?> getRecipesByCountry(@PathVariable Long id) {
        return ResponseEntity.ok(flavorMapService.getRecipesByCountry(id));
    }
}
