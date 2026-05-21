import { useMemo, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { es, enUS } from "date-fns/locale";

import "react-datepicker/dist/react-datepicker.css";
import "./App.css";

registerLocale("es", es);
registerLocale("en-US", enUS);

function App() {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [tema, setTema] = useState("default");
  const [idioma, setIdioma] = useState("es");

  const [quitarSabados, setQuitarSabados] = useState(false);
  const [quitarDomingos, setQuitarDomingos] = useState(false);

  const textos = obtenerTextos(idioma);

  const fechaInicioFormateada = formatearFecha(fechaInicio, idioma);
  const fechaFinFormateada = formatearFecha(fechaFin, idioma);

  const resultado = useMemo(() => {
    if (!fechaInicio || !fechaFin) {
      return {
        valido: false,
        tipo: "warning",
        mensaje:
          idioma === "es" ? "Selecciona ambas fechas." : "Select both dates.",
        dias: 0,
        meses: 0,
        diasRestantes: 0,
        horas: 0,
        sabadosQuitados: 0,
        domingosQuitados: 0,
        totalDiasQuitados: 0,
        totalDiasConDescuento: 0,
      };
    }

    const inicioUTC = convertirDateAUTC(fechaInicio);
    const finUTC = convertirDateAUTC(fechaFin);

    if (finUTC < inicioUTC) {
      return {
        valido: false,
        tipo: "error",
        mensaje:
          idioma === "es"
            ? "La fecha de fin no puede ser menor que la fecha de inicio."
            : "The end date cannot be earlier than the start date.",
        dias: 0,
        meses: 0,
        diasRestantes: 0,
        horas: 0,
        sabadosQuitados: 0,
        domingosQuitados: 0,
        totalDiasQuitados: 0,
        totalDiasConDescuento: 0,
      };
    }

    const milisegundosPorDia = 1000 * 60 * 60 * 24;
    const diferenciaMilisegundos = finUTC - inicioUTC;

    const totalDias = Math.floor(diferenciaMilisegundos / milisegundosPorDia);
    const totalHoras = totalDias * 24;

    const { meses, diasRestantes } = calcularMesesYDias(inicioUTC, finUTC);

    const diasQuitados = calcularDiasQuitados(
      inicioUTC,
      finUTC,
      quitarSabados,
      quitarDomingos
    );

    const totalDiasConDescuento = Math.max(
      totalDias - diasQuitados.totalDiasQuitados,
      0
    );

    return {
      valido: true,
      tipo: "success",
      mensaje: "",
      dias: totalDias,
      meses,
      diasRestantes,
      horas: totalHoras,
      sabadosQuitados: diasQuitados.sabados,
      domingosQuitados: diasQuitados.domingos,
      totalDiasQuitados: diasQuitados.totalDiasQuitados,
      totalDiasConDescuento,
    };
  }, [fechaInicio, fechaFin, idioma, quitarSabados, quitarDomingos]);

  function manejarCambioFechaInicio(fechaSeleccionada) {
    setFechaInicio(fechaSeleccionada);

    if (
      fechaFin &&
      fechaSeleccionada &&
      convertirDateAUTC(fechaFin) < convertirDateAUTC(fechaSeleccionada)
    ) {
      setFechaFin(null);
    }
  }

  function manejarCambioFechaFin(fechaSeleccionada) {
    setFechaFin(fechaSeleccionada);
  }

  function cambiarTema() {
    if (tema === "default") {
      setTema("claro");
    } else if (tema === "claro") {
      setTema("oscuro");
    } else {
      setTema("default");
    }
  }

  function cambiarIdioma() {
    setIdioma((valorActual) => (valorActual === "es" ? "en" : "es"));
  }

  function obtenerTextoBotonTema() {
    if (idioma === "es") {
      if (tema === "default") return "Cambiar a modo claro";
      if (tema === "claro") return "Cambiar a modo oscuro";
      return "Cambiar a modo default";
    }

    if (tema === "default") return "Switch to light mode";
    if (tema === "claro") return "Switch to dark mode";
    return "Switch to default mode";
  }

  function obtenerNombreTema() {
    if (idioma === "es") {
      if (tema === "default") return "default";
      if (tema === "claro") return "claro";
      return "oscuro";
    }

    if (tema === "default") return "default";
    if (tema === "claro") return "light";
    return "dark";
  }

  return (
    <div className="page" data-theme={tema}>
      <button onClick={cambiarIdioma} className="language-button-floating">
        {textos.botonIdioma}
      </button>

      <div className="container">
        <h1 className="title">{textos.titulo}</h1>

        <button onClick={cambiarTema} className="theme-button">
          {obtenerTextoBotonTema()}
        </button>

        <p className="theme-text">
          {textos.temaActual}: {obtenerNombreTema()}
        </p>

        <p className="date-format-text">
          {textos.formatoFecha}: {idioma === "es" ? "dd/mm/yyyy" : "yyyy/mm/dd"}
        </p>

        <div className="form-group">
          <label className="label-text">{textos.fechaInicio}:</label>

          <DatePicker
            selected={fechaInicio}
            onChange={manejarCambioFechaInicio}
            dateFormat={idioma === "es" ? "dd/MM/yyyy" : "yyyy/MM/dd"}
            locale={idioma === "es" ? "es" : "en-US"}
            placeholderText={idioma === "es" ? "dd/mm/yyyy" : "yyyy/mm/dd"}
            className="date-input"
            wrapperClassName="date-picker-wrapper"
            calendarClassName="custom-calendar"
            showPopperArrow={false}
            isClearable
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            scrollableYearDropdown
            yearDropdownItemNumber={100}
          />

          <span className="formatted-date">
            {fechaInicio
              ? `${textos.fechaSeleccionada}: ${fechaInicioFormateada}`
              : textos.sinFechaSeleccionada}
          </span>
        </div>

        <div className="form-group">
          <label className="label-text">{textos.fechaFin}:</label>

          <DatePicker
            selected={fechaFin}
            onChange={manejarCambioFechaFin}
            minDate={fechaInicio}
            disabled={!fechaInicio}
            dateFormat={idioma === "es" ? "dd/MM/yyyy" : "yyyy/MM/dd"}
            locale={idioma === "es" ? "es" : "en-US"}
            placeholderText={idioma === "es" ? "dd/mm/yyyy" : "yyyy/mm/dd"}
            className={`date-input ${!fechaInicio ? "disabled-input" : ""}`}
            wrapperClassName="date-picker-wrapper"
            calendarClassName="custom-calendar"
            showPopperArrow={false}
            isClearable
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            scrollableYearDropdown
            yearDropdownItemNumber={100}
          />

          <span className="formatted-date">
            {fechaFin
              ? `${textos.fechaSeleccionada}: ${fechaFinFormateada}`
              : textos.sinFechaSeleccionada}
          </span>
        </div>

        <div className="remove-days-box">
          <p className="remove-days-title">{textos.quitarDiasTitulo}</p>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={quitarSabados}
              onChange={(e) => setQuitarSabados(e.target.checked)}
            />
            {textos.quitarSabados}
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={quitarDomingos}
              onChange={(e) => setQuitarDomingos(e.target.checked)}
            />
            {textos.quitarDomingos}
          </label>
        </div>

        <div className="result-container">
          {!resultado.valido && (
            <p
              className={
                resultado.tipo === "warning"
                  ? "warning-message"
                  : "error-message"
              }
            >
              {resultado.mensaje}
            </p>
          )}

          {resultado.valido && (
            <>
              <label className="result-label">
                {textos.periodo}: {fechaInicioFormateada} -{" "}
                {fechaFinFormateada}
              </label>

              <label className="result-label">
                {textos.totalDias}: {resultado.dias}
              </label>

              <label className="result-label">
                {textos.mesesDias}:{" "}
                {formatearMesesDias(
                  resultado.meses,
                  resultado.diasRestantes,
                  idioma
                )}
              </label>

              <label className="result-label">
                {textos.totalHoras}: {resultado.horas}
              </label>

              <label className="result-label remove-days-result">
                {textos.quitarDias}: {resultado.totalDiasConDescuento}
              </label>

              <label className="result-label">
                {textos.diasDescontados}: {resultado.totalDiasQuitados}
              </label>

              <label className="result-label small-result">
                {textos.sabadosQuitados}: {resultado.sabadosQuitados} |{" "}
                {textos.domingosQuitados}: {resultado.domingosQuitados}
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function convertirDateAUTC(fecha) {
  return new Date(
    Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
  );
}

function calcularMesesYDias(inicio, fin) {
  let meses =
    (fin.getUTCFullYear() - inicio.getUTCFullYear()) * 12 +
    (fin.getUTCMonth() - inicio.getUTCMonth());

  let fechaTemporal = new Date(
    Date.UTC(
      inicio.getUTCFullYear(),
      inicio.getUTCMonth() + meses,
      inicio.getUTCDate()
    )
  );

  if (fechaTemporal > fin) {
    meses--;

    fechaTemporal = new Date(
      Date.UTC(
        inicio.getUTCFullYear(),
        inicio.getUTCMonth() + meses,
        inicio.getUTCDate()
      )
    );
  }

  const milisegundosPorDia = 1000 * 60 * 60 * 24;
  const diasRestantes = Math.floor((fin - fechaTemporal) / milisegundosPorDia);

  return {
    meses,
    diasRestantes,
  };
}

function calcularDiasQuitados(inicio, fin, quitarSabados, quitarDomingos) {
  let sabados = 0;
  let domingos = 0;

  const fechaActual = new Date(inicio);
  fechaActual.setUTCDate(fechaActual.getUTCDate() + 1);

  while (fechaActual <= fin) {
    const diaSemana = fechaActual.getUTCDay();

    if (quitarSabados && diaSemana === 6) {
      sabados++;
    }

    if (quitarDomingos && diaSemana === 0) {
      domingos++;
    }

    fechaActual.setUTCDate(fechaActual.getUTCDate() + 1);
  }

  return {
    sabados,
    domingos,
    totalDiasQuitados: sabados + domingos,
  };
}

function formatearFecha(fecha, idioma) {
  if (!fecha) return "";

  const day = String(fecha.getDate()).padStart(2, "0");
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const year = fecha.getFullYear();

  if (idioma === "es") {
    return `${day}/${month}/${year}`;
  }

  return `${year}/${month}/${day}`;
}

function formatearMesesDias(meses, dias, idioma) {
  if (idioma === "es") {
    return `${meses} meses y ${dias} días`;
  }

  return `${meses} months and ${dias} days`;
}

function obtenerTextos(idioma) {
  if (idioma === "en") {
    return {
      titulo: "Date comparator",
      botonIdioma: "Cambiar a español",
      temaActual: "Current theme",
      formatoFecha: "Date format",
      fechaInicio: "Start date",
      fechaFin: "End date",
      fechaSeleccionada: "Selected date",
      sinFechaSeleccionada: "No date selected",
      periodo: "Period",
      totalDias: "Total days",
      mesesDias: "Months and days",
      totalHoras: "Total hours",
      quitarDiasTitulo: "Remove days",
      quitarSabados: "Remove Saturdays",
      quitarDomingos: "Remove Sundays",
      quitarDias: "Remove days",
      diasDescontados: "Discounted days",
      sabadosQuitados: "Saturdays removed",
      domingosQuitados: "Sundays removed",
    };
  }

  return {
    titulo: "Comparador de fechas",
    botonIdioma: "Switch to English",
    temaActual: "Tema actual",
    formatoFecha: "Formato de fecha",
    fechaInicio: "Fecha de inicio",
    fechaFin: "Fecha de fin",
    fechaSeleccionada: "Fecha seleccionada",
    sinFechaSeleccionada: "Sin fecha seleccionada",
    periodo: "Periodo",
    totalDias: "Total de días",
    mesesDias: "Meses y días",
    totalHoras: "Total de horas",
    quitarDiasTitulo: "Quitar días",
    quitarSabados: "Quitar sábados",
    quitarDomingos: "Quitar domingos",
    quitarDias: "Quitar días",
    diasDescontados: "Días descontados",
    sabadosQuitados: "Sábados quitados",
    domingosQuitados: "Domingos quitados",
  };
}

export default App;