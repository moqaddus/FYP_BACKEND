import Media from '../models/media.js';

export const createMedia = async (req, res) => {
  try {
    const { ID, Type, BeforeAfter, URL, Event } = req.body;
    const media = new Media({
      ID: ID,
      Type: Type,
      BeforeAfter: BeforeAfter,
      URL: URL,
      Event: Event,
    });

    await media.save();

    res.status(201).json({ media });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      Type,
      BeforeAfter,
      URL,
      Event
    } = req.body;

    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    if (Type) {
      media.Type = Type;
    }
    if (BeforeAfter) {
      media.BeforeAfter = BeforeAfter;
    }
    if (URL) {
      media.URL = URL;
    }
    if (Event) {
      media.Event = Event;
    }

    await media.save();

    res.status(200).json({ media });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getAllMedia = async (req, res) => {
  try {
    const allMedia = await Media.find();

    if (!allMedia || allMedia.length === 0) {
      return res.status(404).json({ message: 'No media found' });
    }

    const formattedMedia = allMedia.map(({ Type, BeforeAfter, URL, Event }) => ({
      Type,
      BeforeAfter,
      URL,
      Event
    }));

    res.status(200).json(formattedMedia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    res.status(200).json({ media });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findByIdAndDelete(id);

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    res.status(200).json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
