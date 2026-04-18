/**
 * RUN & SURVIVE - MÓDULO DE NARRATIVA (NARRATIVA.JS)
 * Identidad: Narrativa-Gamberra.
 * Personalidad: Superviviente cínico, irónico y un poco gamberro.
 */

const DICCIONARIO_NARRATIVA = {
    bienvenida: [
        "Vaya, sigues respirando. Los zombis deben estar perdiendo facultades.",
        "¿Otra vez por aquí? Pensé que ya te habrían convertido en un buffet libre.",
        "Bienvenido a la radio. Sintonizas la única emisora que no te pide suscripción, solo que no mueras.",
        "Ah, el corredor 'estrella'. ¿Vienes a por gloria o solo a por un poco de aire que no huela a muerto?",
        "Mira quién es, el saco de carne favorito de la zona. Prepárate, hoy el aire pica un poco más.",
        "Vaya, otra vez tú. El apocalipsis se está volviendo muy poco selectivo.",
        "¿Sigues con todas tus extremidades? Una pena, me había apostado una lata de atún a que hoy perdías un dedo.",
        "¡Cuidado! No te emociones mucho al entrar, que la alegría gasta calorías y no nos sobran.",
        "Ah, el recluta favorito del sofá ha vuelto. ¿Vienes a por gloria o solo a gastar mi oxígeno?",
        "Dime que traes café. No, espera, el café se extinguió en el 29. Trae algo que no se mueva, me conformo.",
        "¿Esas son ojeras o es que el rímel post-apocalíptico es así de intenso? Sea como sea, pareces un panda con depresión.",
        "¿Has dormido bien? Espero que sí, porque el mundo exterior no ha tenido una buena noche. Está... hambriento."
    ],
    explorador: [
        "A este ritmo te va a adelantar una tortuga con reúma, pero al menos traes suministros.",
        "Paseando, ¿eh? Claro, porque los mutantes son conocidos por su paciencia infinita.",
        "Vas tan despacio que los pájaros están empezando a anidar en tus hombros. ¡Acelera un poco!",
        "Modo paseo activado. Espero que estés buscando algo valioso y no solo contando hormigas.",
        "Mirando el paisaje... Sí, es precioso. Ruinas, sangre y desesperación. Muy idílico todo.",
        "Precioso paseo. He visto glaciares con más prisa que tú, pero bueno, trae madera.",
        "¿Estás andando o estás practicando para ser un extra de zombi lento?",
        "Disfruta del paisaje, recluta. Total, lo único que hay son escombros y mi desprecio.",
        "Paso a paso se llega lejos... o te pillan por detrás. Yo que tú no me encantaba con las flores.",
        "Vas tan lento que el moho está empezando a ganar la carrera por tus zapatillas.",
        "Caminar es saludable, decían. Los que lo decían ahora son abono, pero tú sigue a tu ritmo."
    ],
    huida: [
        "¡Eso es! Corre como si te debieran dinero. ¡Más rápido!",
        "¡Mueve el culo! Huelo el aliento de un corredor detrás de ti... o igual es tu desodorante caducado.",
        "¡Velocidad máxima! Si sigues así, vas a romper la barrera del sonido o tus rodillas, lo que pase antes.",
        "Ese es el espíritu. El que corre vive, el que se para... bueno, el que se para decora el asfalto.",
        "¡Dale gas! Si no te matan los zombis, te matará el flato, pero al menos morirás con estilo.",
        "¡Eso es! ¡Mueve esas piernas como si la parca te estuviera pidiendo la hora!",
        "Correr es de cobardes, pero los cobardes vivos construyen mejores bases. ¡Dale duro!",
        "¿Eso es sudor o es que estás llorando por los poros? ¡Sigue corriendo!",
        "Si los mutantes te pillan, por favor, no les digas que me conoces. Me bajaría el caché.",
        "¡Brillante! Si sigues así, el viento se encargará de peinarte... si es que te queda pelo.",
        "Correr quema calorías. Y en este mundo, las calorías son lo único que te separa de ser un carpaccio para mutantes."
    ],
    supervivencia: [
        "Tienes la lengua tan seca que si hablas vas a echar chispas. ¡Bebe algo!",
        "Tu estómago suena más fuerte que la radio vieja. O comes algo o te comerás tus propias botas.",
        "Estás a dos pasos de convertirte en decoración de jardín. Hidrátate o vete cavando un hoyo.",
        "Tus riñones están pidiendo la jubilación anticipada. Bebe algo antes de que se declaren en huelga.",
        "Ese sonido de tripas... ¿es hambre o es que has engullido un motor de dos tiempos? Come algo.",
        "Tus niveles de agua están tan bajos que podrías cruzar el desierto del Sahara sin mojarte un pie. ¡Bebe!",
        "Comida. ¿Recuerdas lo que es? Esa cosa que se mastica y te mantiene sin ver la luz al final del túnel. Búscala."
    ],
    gps: [
        "Los satélites están más oxidados que mi abuela. Quieto ahí hasta que te encuentre.",
        "Se ha perdido la señal. O los satélites han caído, o te has metido en el culo del mundo.",
        "Buscando señal... Parece que el GPS se ha ido de copas con los supervivientes del Sector 4.",
        "¿Dónde narices te has metido? No apareces ni en los mapas del siglo pasado. ¡Quieto!",
        "Señal débil. Muévete un poco, igual si levantas un brazo captas algo que no sea estática.",
        "¿Dónde te has metido? ¿En un agujero de gusano? El satélite no te ve ni con lupa.",
        "¡Quieto ahí! O el GPS se ha vuelto loco o acabas de aprender a teletransportarte. Y no me creo lo segundo.",
        "Incluso los satélites se han aburrido de esperarte. Vuelve al radar o búscate un guía espiritual."
    ],
    amenaza: [
        "Huelo a comida podrida y creo que eres tú. ¡Mueve el culo o te borro del mapa!",
        "Llevas 24 horas parado. ¿Te has convertido en estatua o es que ya eres parte del mobiliario?",
        "Si no te mueves pronto, voy a empezar a apostar sobre cuánto tardan en devorarte las moscas.",
        "¡Eh! ¡Despierta! La inercia es para los muertos, y tú técnicamente sigues vivo. Creo.",
        "Tu medidor de actividad está más plano que el encefalograma de un zombi. ¡Levántate!",
        "Llevas 24h parado. El polvo que tienes encima ya tiene su propio ecosistema. ¡Muévete!",
        "¿Sabes qué les pasa a los que se quedan quietos? Que pasan a ser parte del menú. Tic-tac, recluta.",
        "Si no sales hoy, voy a vender tus botas por un par de clavos oxidados. No te sirven de nada en el sofá.",
        "La última vez que alguien estuvo tanto tiempo quieto, los arqueólogos lo llamaron 'fósil'. No seas el siguiente.",
        "Moverse es vida. Quedarse quieto es... bueno, es básicamente facilitarles el trabajo a los cuervos."
    ],
    edificios: {
        scrap_warehouse: [
            "Un montón de chatarra con techo. Lo llamamos almacén por no decir 'vertedero organizado'.",
            "Aquí guardamos todo lo que brilla. Y lo que no brilla también, por si acaso.",
            "El paraíso de Diógenes. Si no lo usamos hoy, lo usaremos cuando el mundo se acabe... otra vez."
        ],
        water_purifier: [
            "Filtra el 90% de las mutaciones. El otro 10% te da un saludable brillo radiactivo en la oscuridad.",
            "Agua casi potable. Si sabe a metal, es que estás recuperando hierro. De nada.",
            "Bebe sin miedo. Si te sale un tercer brazo, nos vendrá bien para construir más rápido."
        ],
        watchtower: [
            "Si te caes, al menos habrás visto un paisaje bonito antes de morir.",
            "La mejor vista del apocalipsis. Desde aquí la desesperación se ve en alta definición.",
            "Unos palos mal puestos que te dan una ventaja táctica... o al menos te hacen sentir más alto."
        ],
        radio_antenna: [
            "Capta estática, psicofonías y, a veces, ofertas de seguros del viejo mundo.",
            "Nuestra conexión con el vacío. A veces alguien contesta, pero suele ser para insultar.",
            "Escucha las voces del pasado. O la estática de un mundo que ya no sabe qué decir."
        ]
    }
};

/**
 * Obtiene un mensaje aleatorio de una categoría.
 * @param {string} categoria - La categoría del mensaje (ej: 'bienvenida', 'explorador', 'huida', 'gps', 'amenaza', 'supervivencia').
 * @param {string} [subcategoria] - Para categorías con subniveles como 'edificios'.
 * @returns {string} - Una frase con el sello del Narrador Gamberro.
 */
function obtenerMensaje(categoria, subcategoria = null) {
    let lista = DICCIONARIO_NARRATIVA[categoria];
    
    if (subcategoria && lista && lista[subcategoria]) {
        lista = lista[subcategoria];
    }

    if (!lista || (Array.isArray(lista) && lista.length === 0)) {
        return "Incluso yo me he quedado sin palabras. Y eso es decir mucho.";
    }

    // Si es un array, devolver uno aleatorio
    if (Array.isArray(lista)) {
        const indice = Math.floor(Math.random() * lista.length);
        return lista[indice];
    }

    // Si por alguna razón llegamos aquí y no es un array (y no se manejó subcategoría)
    return "Error en la radio: Demasiada estática para insultarte correctamente.";
}

// Exportar para que otros módulos lo usen (si se usa en navegador sin módulos, estará en el scope global)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DICCIONARIO_NARRATIVA, obtenerMensaje };
}
