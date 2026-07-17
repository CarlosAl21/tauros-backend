import { Controller, Get, Header } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

const LAST_UPDATED = '17 de julio de 2026';
const CONTACT_EMAIL = 'g4to101@gmail.com';

function htmlDocument(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 24px; color: #1a1a1a; }
    h1 { font-size: 1.8rem; }
    h2 { font-size: 1.3rem; margin-top: 2rem; }
    p, li { font-size: 1rem; }
    .updated { color: #555; font-style: italic; margin-bottom: 2rem; }
    footer { margin-top: 3rem; color: #555; font-size: 0.9rem; }
  </style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

@ApiTags('legal')
@Controller()
export class LegalController {
  @Get('privacy')
  @ApiOperation({ summary: 'Política de Privacidad (HTML público)' })
  @Header('Content-Type', 'text/html; charset=utf-8')
  getPrivacyPolicy(): string {
    return htmlDocument(
      'Política de Privacidad - TaurosGym',
      `
  <h1>Política de Privacidad de TaurosGym</h1>
  <p class="updated">Última actualización: ${LAST_UPDATED}</p>

  <p>
    TaurosGym ("Tauros", "la App", "nosotros") es una aplicación móvil de entrenamiento
    (rutinas) y nutrición que permite a sus usuarios iniciar sesión de forma segura,
    verificar su identidad mediante un segundo factor (2FA) por correo electrónico,
    y acceder a sus rutinas de entrenamiento incluso sin conexión a internet
    (sincronización offline). Esta Política de Privacidad explica qué información
    recolectamos, para qué la usamos y qué derechos tiene el usuario sobre sus datos.
  </p>

  <h2>1. Datos que recolectamos</h2>
  <p>Al usar TaurosGym podemos recolectar y almacenar los siguientes datos personales:</p>
  <ul>
    <li>Nombre y apellido</li>
    <li>Cédula o RUC</li>
    <li>Número de teléfono</li>
    <li>Correo electrónico</li>
    <li>Fecha de nacimiento</li>
    <li>Contraseña (almacenada siempre de forma cifrada/hasheada, nunca en texto plano)</li>
    <li>Peso corporal y demás datos de composición corporal que el usuario registre</li>
    <li>Rutinas y planes de entrenamiento y nutrición asignados por su entrenador</li>
  </ul>

  <h2>2. Finalidad del tratamiento de datos</h2>
  <p>Utilizamos estos datos exclusivamente para:</p>
  <ul>
    <li>Prestar el servicio de entrenamiento y nutrición personalizado.</li>
    <li>Autenticar al usuario y proteger la seguridad de su cuenta, incluyendo la
      verificación en dos pasos (2FA) enviada por correo electrónico.</li>
    <li>Permitir el uso offline de rutinas previamente sincronizadas.</li>
    <li>Comunicarnos con el usuario por asuntos relacionados con su cuenta o el servicio.</li>
  </ul>

  <h2>3. Compartición de datos con terceros</h2>
  <p>
    TaurosGym <strong>no comparte, vende ni cede</strong> los datos personales del usuario
    a terceros con fines publicitarios. La App no integra herramientas de analítica de
    terceros ni redes de publicidad (ads/SDKs de marketing). El envío de correos de
    verificación (2FA) se realiza a través de un proveedor de correo (SMTP) utilizado
    únicamente como medio técnico de entrega, sin fines comerciales.
  </p>

  <h2>4. Derechos del usuario</h2>
  <p>El usuario tiene derecho a:</p>
  <ul>
    <li><strong>Acceso:</strong> consultar los datos personales asociados a su cuenta desde
      su perfil dentro de la App.</li>
    <li><strong>Rectificación:</strong> corregir o actualizar sus datos personales en
      cualquier momento mediante la opción "Editar datos personales" en su Perfil.</li>
    <li>
      <strong>Eliminación:</strong> el usuario puede solicitar la eliminación de su cuenta
      en cualquier momento siguiendo estos pasos:
      <ol>
        <li>Abrir la App e iniciar sesión con su cuenta.</li>
        <li>Ir a la sección <strong>Perfil</strong>.</li>
        <li>Seleccionar la opción <strong>"Eliminar cuenta"</strong>.</li>
        <li>Confirmar la acción cuando la App lo solicite.</li>
      </ol>
      Esta acción es irreversible y se procesa de inmediato.
    </li>
  </ul>

  <h2>5. Retención de datos</h2>
  <p>Al eliminar una cuenta:</p>
  <ul>
    <li>
      <strong>Se eliminan de forma permanente e inmediata:</strong> las sesiones y tokens
      de acceso activos (refresh tokens) y cualquier desafío de verificación en dos pasos
      (2FA) pendiente.
    </li>
    <li>
      <strong>Se anonimizan de forma permanente e inmediata:</strong> los datos personales
      identificables asociados a la cuenta (nombre, apellido, correo electrónico, cédula,
      teléfono y contraseña), que se sobrescriben y dejan de estar vinculados a una
      identidad real.
    </li>
    <li>
      <strong>Se conservan de forma indefinida, ya anonimizados:</strong> los registros
      históricos de entrenamiento, composición corporal y nutrición asociados a la cuenta,
      exclusivamente con fines estadísticos e históricos internos, sin ningún dato que
      permita identificar al usuario que los generó.
    </li>
  </ul>

  <h2>6. Menores de edad</h2>
  <p>
    TaurosGym no está dirigida a menores de 13 años y no recolecta conscientemente datos
    de menores de dicha edad.
  </p>

  <h2>7. Seguridad</h2>
  <p>
    Las contraseñas se almacenan siempre cifradas (hash), nunca en texto plano, y el
    acceso a la cuenta puede protegerse adicionalmente con verificación en dos pasos
    (2FA) por correo electrónico.
  </p>

  <h2>8. Contacto</h2>
  <p>
    Para consultas sobre esta Política de Privacidad o para ejercer sus derechos sobre
    sus datos personales, puede escribirnos a
    <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.
  </p>

  <footer>TaurosGym &mdash; Política de Privacidad</footer>
      `,
    );
  }

  @Get('terms')
  @ApiOperation({ summary: 'Términos de Uso (HTML público)' })
  @Header('Content-Type', 'text/html; charset=utf-8')
  getTermsOfUse(): string {
    return htmlDocument(
      'Términos de Uso - TaurosGym',
      `
  <h1>Términos de Uso de TaurosGym</h1>
  <p class="updated">Última actualización: ${LAST_UPDATED}</p>

  <p>
    Al registrarse y utilizar TaurosGym ("Tauros", "la App"), el usuario acepta los
    siguientes Términos de Uso. Si no está de acuerdo, no debe utilizar la aplicación.
  </p>

  <h2>1. Naturaleza del servicio</h2>
  <p>
    TaurosGym es una herramienta de apoyo para el entrenamiento físico y la nutrición.
    <strong>Los entrenamientos y planes nutricionales sugeridos por la App son de carácter
    orientativo y no sustituyen la valoración, diagnóstico o supervisión de un
    profesional de la salud, medicina deportiva o nutrición.</strong> El usuario es
    responsable de consultar a un profesional antes de iniciar cualquier rutina de
    ejercicio o plan nutricional, especialmente si tiene condiciones médicas preexistentes.
  </p>

  <h2>2. Uso responsable</h2>
  <p>
    El usuario se compromete a utilizar la App de forma responsable, proporcionar
    información veraz y actualizada, y no utilizar el servicio con fines distintos a
    los previstos (entrenamiento y seguimiento nutricional personal).
  </p>

  <h2>3. Cuenta y seguridad de la contraseña</h2>
  <p>
    El usuario es responsable de mantener la confidencialidad de su contraseña y de
    toda actividad realizada desde su cuenta. Se recomienda activar la verificación en
    dos pasos (2FA) por correo electrónico como medida adicional de seguridad. Si el
    usuario sospecha un uso no autorizado de su cuenta, debe cambiar su contraseña de
    inmediato y contactarnos.
  </p>

  <h2>4. Disponibilidad del servicio</h2>
  <p>
    TaurosGym se ofrece "tal cual" y "según disponibilidad". No garantizamos que el
    servicio esté libre de interrupciones, errores o disponible de forma ininterrumpida.
    Algunas funciones de rutinas permanecen disponibles sin conexión (offline) mediante
    sincronización previa, pero otras funciones requieren conexión a internet.
  </p>

  <h2>5. Limitación de responsabilidad</h2>
  <p>
    En la máxima medida permitida por la ley, TaurosGym no será responsable por lesiones,
    daños o perjuicios derivados del uso de las rutinas de entrenamiento o planes
    nutricionales sugeridos por la App, ni por decisiones tomadas por el usuario sin
    supervisión profesional adecuada.
  </p>

  <h2>6. Terminación de la cuenta</h2>
  <p>
    El usuario puede eliminar su cuenta en cualquier momento desde la opción "Eliminar
    cuenta" en su Perfil dentro de la App. Asimismo, nos reservamos el derecho de
    suspender o terminar el acceso de un usuario en caso de incumplimiento de estos
    Términos de Uso.
  </p>

  <h2>7. Legislación aplicable</h2>
  <p>
    Estos Términos de Uso se rigen por las leyes de la República del Ecuador. Cualquier
    controversia relacionada con el uso de TaurosGym se someterá a la jurisdicción de
    los tribunales competentes de Ecuador.
  </p>

  <h2>8. Contacto</h2>
  <p>
    Para consultas sobre estos Términos de Uso, puede escribirnos a
    <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.
  </p>

  <footer>TaurosGym &mdash; Términos de Uso</footer>
      `,
    );
  }
}
