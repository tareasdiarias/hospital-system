package com.example.hospitalsystem.controller;

import com.example.hospitalsystem.model.DetalleFactura;
import com.example.hospitalsystem.model.Factura;
import com.example.hospitalsystem.service.FacturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/facturas")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class FacturaController {

    @Autowired
    private FacturaService facturaService;

    // ADMIN y RECEPCIONISTA pueden VER facturas
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<List<Factura>> getAllFacturas() {
        return ResponseEntity.ok(facturaService.getAllFacturas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<Factura> getFacturaById(@PathVariable Long id) {
        return facturaService.getFacturaById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/paciente/{idPaciente}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<List<Factura>> getFacturasByPaciente(@PathVariable Long idPaciente) {
        return ResponseEntity.ok(facturaService.getFacturasByPaciente(idPaciente));
    }

    // ADMIN y RECEPCIONISTA pueden CREAR facturas
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<Factura> createFactura(@RequestBody Factura factura) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facturaService.createFactura(factura));
    }

    // ADMIN y RECEPCIONISTA pueden ACTUALIZAR facturas
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<Factura> updateFactura(@PathVariable Long id, @RequestBody Factura factura) {
        Factura updatedFactura = facturaService.updateFactura(id, factura);
        if (updatedFactura != null) {
            return ResponseEntity.ok(updatedFactura);
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<Factura> cambiarEstado(@PathVariable Long id,
                                                 @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        Factura updatedFactura = facturaService.cambiarEstado(id, nuevoEstado);
        if (updatedFactura != null) {
            return ResponseEntity.ok(updatedFactura);
        }
        return ResponseEntity.notFound().build();
    }

    // Solo ADMIN puede ELIMINAR facturas
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFactura(@PathVariable Long id) {
        if (facturaService.deleteFactura(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Endpoints para Detalles
    @GetMapping("/{idFactura}/detalles")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<List<DetalleFactura>> getDetallesByFactura(@PathVariable Long idFactura) {
        return ResponseEntity.ok(facturaService.getDetallesByFactura(idFactura));
    }

    @PostMapping("/{idFactura}/detalles")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<DetalleFactura> addDetalle(@PathVariable Long idFactura,
                                                     @RequestBody DetalleFactura detalle) {
        detalle.setIdFactura(idFactura);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(facturaService.addDetalle(detalle));
    }
}
