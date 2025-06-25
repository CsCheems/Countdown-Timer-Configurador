const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const configJson = urlParams.get("configJson") || "";

const widgetUrl = urlParams.get("widgetUrl") || "";

fetch('./config/config.json')
    .then(response => response.json())
    .then(config => {
        armarFormulario(config);
        aplicarOpcionesDefault(config);
        generarUrl(config);
        cargarDesdeUrl(config);

        document.getElementById('btnWidgetUrl').addEventListener('click', () => {
            generarUrl(config);
        });
    })
    .catch(error => {
        console.error('Error cargando config.json', error);
    });

function armarFormulario(config) {
    const contenedor = document.querySelector(".opciones-container");
    contenedor.innerHTML = '<h2>Configuración</h2>';

    const grupos = {};

    config.config.forEach(campo => {
        if (!grupos[campo.group]) {
            grupos[campo.group] = [];
        }
        grupos[campo.group].push(campo);
    });

    Object.keys(grupos).forEach(grupo => {
        const tituloGrupo = document.createElement('h4');
        tituloGrupo.textContent = grupo;
        contenedor.appendChild(tituloGrupo);

        const campos = grupos[grupo];

        if (grupo === "Temporizador") {
            const filaTiempos = document.createElement('div');
            filaTiempos.classList.add('row');

            ["startingTime", "maxTime"].forEach(id => {
                const campo = campos.find(c => c.id === id);
                if (campo) {
                    filaTiempos.appendChild(crearCampo(campo));
                }
            });
            contenedor.appendChild(filaTiempos);

            const filaTiers = document.createElement('div');
            filaTiers.classList.add('row');

            ["tier0", "tier1", "tier2", "tier3"].forEach(id => {
                const campo = campos.find(c => c.id === id);
                if (campo) {
                    filaTiers.appendChild(crearCampo(campo));
                }
            });
            contenedor.appendChild(filaTiers);

            const filaOtros = document.createElement('div');
            filaOtros.classList.add('row');

            campos.forEach(campo => {
                if (
                    ["startingTime", "maxTime", "tier0", "tier1", "tier2", "tier3"].includes(campo.id)
                ) return;
                filaOtros.appendChild(crearCampo(campo));
            });
            contenedor.appendChild(filaOtros);
        } else {
            const fila = document.createElement('div');
            fila.classList.add('row');
            campos.forEach(campo => {
                fila.appendChild(crearCampo(campo));
            });
            contenedor.appendChild(fila);
        }
    });
    actualizarPreview();
}

function crearCampo(campo) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-group');

    const label = document.createElement('label');
    label.setAttribute('for', campo.id);
    label.textContent = campo.label;
    wrapper.appendChild(label);

    const input = document.createElement('input');
    input.type = campo.type;
    input.id = campo.id;
    input.name = campo.id;
    input.value = campo.defaultValue || "";
    input.onchange = actualizarPreview;

    if (campo.type === 'number' && campo.step) {
        input.step = campo.step;
    }

    wrapper.appendChild(input);

    if (campo.note) {
        const note = document.createElement('small');
        note.classList.add('form-note');
        note.textContent = campo.note;
        wrapper.appendChild(note);
    }

    return wrapper;
}

function aplicarOpcionesDefault(config) {
  const urlParams = new URLSearchParams(window.location.search);
  config.config.forEach(item => {
    const input = document.getElementById(item.id);
    if (!input || !urlParams.has(item.id)) return;
    input.value = urlParams.get(item.id);
  });
}

function generarUrl(config) {
  const baseUrl = "https://cscheems.github.io/Countdown-Timer/";
  const params = new URLSearchParams();

  config.config.forEach(item => {
    const el = document.getElementById(item.id);
    if (!el) return;

    let value = el.value;

    // Convertir a segundos si es startingTime o maxTime
    if (item.id === "startingTime" || item.id === "maxTime") {
      value = tiempoAHorasSegundos(value);
    }

    params.set(item.id, value);
  });

  const finalUrl = `${baseUrl}?${params.toString()}`;
  document.getElementById("widgetUrlInput").value = finalUrl;
}

function actualizarPreview() {
  const baseURL = "https://cscheems.github.io/Countdown-Timer/";

  // Obtener los valores como string tipo "HH:MM:SS"
  const startingTime = tiempoAHorasSegundos(document.getElementById("startingTime").value);
  const maxTime = tiempoAHorasSegundos(document.getElementById("maxTime").value);

  const tier0 = document.getElementById("tier0").value;
  const tier1 = document.getElementById("tier1").value;
  const tier2 = document.getElementById("tier2").value;
  const tier3 = document.getElementById("tier3").value;
  const minBits = document.getElementById("minBits").value;
  const bitsTime = document.getElementById("bitsTime").value;

  const dono1 = document.getElementById("dono1").value;
  const dono2 = document.getElementById("dono2").value;
  const dono3 = document.getElementById("dono3").value;
  const dono1Time = document.getElementById("dono1Time").value;
  const dono2Time = document.getElementById("dono2Time").value;
  const dono3Time = document.getElementById("dono3Time").value;


  const fondoColor = document.getElementById("fondoColor").value;
  const opacidad = document.getElementById("opacidad").value;
  const colorFuente = document.getElementById("colorFuente").value;
  const fuenteLetra = document.getElementById("fuenteLetra").value;

  const address = document.getElementById("address").value;
  const port = document.getElementById("port").value;

  // Usar segundos en el URL
  const params = new URLSearchParams({
    startingTime: startingTime.toString(),
    maxTime: maxTime.toString(),
    tier0,
    tier1,
    tier2,
    tier3,
    minBits,
    bitsTime,
    dono1,
    dono2,
    dono3,
    dono1Time,
    dono2Time,
    dono3Time,
    fondoColor,
    opacidad,
    colorFuente,
    fuenteLetra,
    address,
    port
  });

  const finalUrl = `${baseURL}?${params.toString()}`;

  // Mostrar la URL generada
  document.getElementById("widgetUrlInput").value = finalUrl;
  document.getElementById("widget-preview-frame").src = finalUrl;
}

function tiempoAHorasSegundos(horaString) {
  const [horas, minutos, segundos] = horaString.split(":").map(Number);
  return (horas * 3600) + (minutos * 60) + segundos;
}


function cargarDesdeUrl(config) {
  const urlParams = new URLSearchParams(window.location.search);
  config.config.forEach(item => {
    const input = document.getElementById(item.id);
    if (!input || !urlParams.has(item.id)) return;

    input.value = urlParams.get(item.id);
    
  });
}

function copiarUrl() {
  const input = document.getElementById("widgetUrlInput");
  navigator.clipboard.writeText(input.value);

  const urlCopiado = document.createElement('span');
  urlCopiado.textContent = 'Copiado';

  // Estilos para el span
  Object.assign(urlCopiado.style, {
    color: 'white',
    fontWeight: 'bold',
    position: 'absolute',
    backgroundColor: '#45A049',
    padding: '5px 10px',
    borderRadius: '10px',
    zIndex: '2',
    opacity: '0',
    left: '50%',
    top: '-35px',
    transform: 'translate(-50%, 175%)',
    transition: 'opacity 0.2s ease-in-out',
    pointerEvents: 'none'
  });

  const widgetUrlInputContainer = document.getElementById("widgetUrlInputContainer");
  widgetUrlInputContainer.appendChild(urlCopiado);

  // Forzar reflow
  void urlCopiado.offsetWidth;

  urlCopiado.style.opacity = '1';

  setTimeout(() => {
    urlCopiado.style.opacity = '0';
    setTimeout(() => {
      if (urlCopiado.parentElement) {
        widgetUrlInputContainer.removeChild(urlCopiado);
      }
    }, 500);
  }, 2000); // Más rápido
}


