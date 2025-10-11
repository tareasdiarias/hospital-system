package com.example.hospitalsystem.controller;

import com.example.hospitalsystem.model.Cita;
import com.example.hospitalsystem.service.CitaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CitaController {

    @Autowired
    private CitaService citaService;

    // Todos pueden VER citas
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Cita>> getAllCitas() {
        return ResponseEntity.ok(citaService.getAllCitas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPCIONISTA')")
    public ResponseEntity<Cita> getCitaById(@PathVariable Long id) {
        return citaService.getCitaById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/paciente/{idPaciente}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Cita>> getCitasByPaciente(@PathVariable Long idPaciente) {
        return ResponseEntity.ok(citaService.getCitasByPaciente(idPaciente));
    }

    @GetMapping("/medico/{idMedico}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Cita>> getCitasByMedico(@PathVariable Long idMedico) {
        return ResponseEntity.ok(citaService.getCitasByMedico(idMedico));
    }

    @GetMapping("/fecha/{fecha}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Cita>> getCitasByFecha(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(citaService.getCitasByFecha(fecha));
    }

    // ADMIN y RECEPCIONISTA pueden CREAR citas
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<Cita> createCita(@RequestBody Cita cita) {
        return ResponseEntity.status(HttpStatus.CREATED).body(citaService.createCita(cita));
    }

    // ADMIN, DOCTOR y RECEPCIONISTA pueden ACTUALIZAR citas
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPCIONISTA')")
    public ResponseEntity<Cita> updateCita(@PathVariable Long id, @RequestBody Cita cita) {
        Cita updatedCita = citaService.updateCita(id, cita);
        if (updatedCita != null) {
            return ResponseEntity.ok(updatedCita);
        }
        return ResponseEntity.notFound().build();
    }

    // DOCTOR y ADMIN pueden cambiar estado
    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Cita> cambiarEstado(@PathVariable Long id,
                                              @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        Cita updatedCita = citaService.cambiarEstado(id, nuevoEstado);
        if (updatedCita != null) {
            return ResponseEntity.ok(updatedCita);
        }
        return ResponseEntity.notFound().build();
    }

    // Solo ADMIN puede ELIMINAR citas
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCita(@PathVariable Long id) {
        if (citaService.deleteCita(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
